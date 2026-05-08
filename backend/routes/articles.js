const express = require('express');
const Article = require('../models/Article');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { uploadFields } = require('../middleware/upload');
const path = require('path');

const router = express.Router();

// Multer configuration moved to middleware/upload.js

// Get all published articles with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      tags,
      author,
      search,
      featured,
      language = 'en',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { status: 'published' };
    if (featured === 'true') filter.featured = true;

    // Apply filters
    if (category) filter.category = category;
    if (author) filter.author = author;
    if (tags) {
      const tagArray = tags.split(',');
      filter.tags = { $in: tagArray };
    }

    // Search in title and content
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { [`translations.${language}.title`]: { $regex: search, $options: 'i' } },
        { [`translations.${language}.content`]: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const articles = await Article.find(filter)
      .populate('author', 'name profile.picture')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Article.countDocuments(filter);

    res.json({
      articles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single article by ID
router.get('/:id', async (req, res) => {
  try {
    // Try to get token from header to identify user, but don't fail if not present
    const token = req.header('Authorization')?.replace('Bearer ', '');
    let currentUser = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUser = await User.findById(decoded.userId);
      } catch (e) {
        // Token invalid or expired, treat as public
      }
    }

    const article = await Article.findById(req.params.id)
      .populate('author', 'name profile.picture profile.bio')
      .populate('comments.user', 'name profile.picture');

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check if article is published OR user is author/admin
    const isAuthor = currentUser && article.author && article.author._id.toString() === currentUser._id.toString();
    const isAdmin = currentUser && currentUser.role === 'admin';

    if (article.status !== 'published' && !isAuthor && !isAdmin) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Increment view count for published articles or unique public visits
    if (article.status === 'published') {
      await Article.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    }

    res.json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const { getSafeCreateStatus } = require('../utils/statusTransitions');

// Create new article (Publisher only)
router.post('/', auth, authorize('publisher', 'admin'), uploadFields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'additionalMedia', maxCount: 5 }
]), async (req, res) => {
  try {
    const { title, content, category, tags, translations, status = 'draft', scheduledPublish } = req.body;

    // Validate and get safe status for creation
    const safeStatus = getSafeCreateStatus(status, req.user.role);

    const articleData = {
      title,
      content,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      author: req.user._id,
      status: safeStatus,
      scheduledPublish: safeStatus === 'scheduled' ? scheduledPublish : undefined
    };

    // Add translations if provided
    if (translations) {
      articleData.translations = JSON.parse(translations);
    }

    // Handle file uploads
    if (req.files.featuredImage) {
      articleData.featuredImage = req.files.featuredImage[0].path.replace(/\\/g, '/');
    }

    if (req.files.additionalMedia) {
      articleData.additionalMedia = req.files.additionalMedia.map(file => file.path.replace(/\\/g, '/'));
    }

    const article = new Article(articleData);
    await article.save();

    await article.populate('author', 'name profile.picture');

    res.status(201).json({
      message: 'Article created successfully',
      article
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const { validateStatusTransition } = require('../utils/statusTransitions');

// Update article (Author or Admin only)
router.put('/:id', auth, uploadFields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'additionalMedia', maxCount: 5 }
]), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to edit this article' });
    }

    const updates = req.body;
    const allowedUpdates = ['title', 'content', 'category', 'tags', 'translations', 'status', 'scheduledPublish'];

    // Validate status transition if status is being changed
    if (updates.status && updates.status !== article.status) {
      const validation = validateStatusTransition(
        article.status,
        updates.status,
        req.user.role
      );

      if (!validation.valid) {
        return res.status(400).json({
          error: validation.error,
          currentStatus: article.status,
          attemptedStatus: updates.status
        });
      }
    }

    // Filter allowed updates
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'tags' && typeof updates[key] === 'string') {
          article[key] = updates[key].split(',').map(tag => tag.trim());
        } else if (key === 'translations' && typeof updates[key] === 'string') {
          article[key] = JSON.parse(updates[key]);
        } else {
          article[key] = updates[key];
        }
      }
    });

    // Handle file uploads
    if (req.files.featuredImage) {
      article.featuredImage = req.files.featuredImage[0].path.replace(/\\/g, '/');
    }

    if (req.files.additionalMedia) {
      article.additionalMedia = req.files.additionalMedia.map(file => file.path.replace(/\\/g, '/'));
    }



    await article.save();
    await article.populate('author', 'name profile.picture');

    res.json({
      message: 'Article updated successfully',
      article
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete article (Author or Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this article' });
    }

    await Article.findByIdAndDelete(req.params.id);

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get articles by current user (Publisher)
router.get('/my/articles', auth, authorize('publisher', 'admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { author: req.user._id };
    if (status) filter.status = status;

    const articles = await Article.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Article.countDocuments(filter);

    res.json({
      articles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get article analytics (Author or Admin only)
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to view analytics' });
    }

    const analytics = {
      views: article.views,
      likes: article.likes.length,
      shares: article.shares,
      comments: article.comments.length,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt
    };

    res.json(analytics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Like/Unlike article
router.post('/:id/like', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const userLiked = article.likes.includes(req.user._id);

    if (userLiked) {
      // Unlike
      article.likes = article.likes.filter(like => like.toString() !== req.user._id.toString());
    } else {
      // Like
      article.likes.push(req.user._id);
    }

    await article.save();

    res.json({
      message: userLiked ? 'Article unliked' : 'Article liked',
      likes: article.likes.length,
      userLiked: !userLiked
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add comment to article
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    article.comments.push({
      user: req.user._id,
      content
    });

    await article.save();
    await article.populate('comments.user', 'name profile.picture');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: article.comments[article.comments.length - 1]
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Share article (increment share count) - Requires authentication
router.post('/:id/share', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    article.shares += 1;
    await article.save();

    res.json({
      message: 'Article shared',
      shares: article.shares
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Bookmark/Unbookmark article
router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const user = await User.findById(req.user._id);
    const isBookmarked = user.bookmarks.includes(article._id);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(id => id.toString() !== article._id.toString());
    } else {
      user.bookmarks.push(article._id);
    }

    await user.save();
    res.json({
      message: isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks',
      isBookmarked: !isBookmarked
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get bookmarked articles
router.get('/my/bookmarks', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarks',
      populate: { path: 'author', select: 'name profile.picture' }
    });
    res.json(user.bookmarks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all categories from published articles
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Article.find({ status: 'published' }).distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
