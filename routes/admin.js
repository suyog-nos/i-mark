const express = require('express');
const Article = require('../models/Article');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const EmailService = require('../utils/emailService');

const router = express.Router();

// Get all articles for admin review
router.get('/articles', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, author } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (author) filter.author = author;

    const articles = await Article.find(filter)
      .populate('author', 'name email profile.picture')
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

// Approve article
router.put('/articles/:id/approve', auth, authorize('admin'), async (req, res) => {
  try {
    const { reason = '' } = req.body;
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      {
        status: 'published',
        reviewerComments: reason
      },
      { new: true }
    ).populate('author', 'name email');

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (req.io) {
      req.io.emit('article_published', article);
    }

    // Trigger email notification (don't await to avoid blocking)
    if (article.author && article.author.email) {
      EmailService.notifyModerationAction(article.author, article, 'published', reason)
        .catch(err => console.error('Email notification failed:', err));
    }

    res.json({
      message: 'Article approved and published',
      article
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reject article
router.put('/articles/:id/reject', auth, authorize('admin'), async (req, res) => {
  try {
    const { reason } = req.body;

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        reviewerComments: reason
      },
      { new: true }
    ).populate('author', 'name email');

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Trigger email notification
    if (article.author && article.author.email) {
      EmailService.notifyModerationAction(article.author, article, 'rejected', reason)
        .catch(err => console.error('Email notification failed:', err));
    }

    res.json({
      message: 'Article rejected',
      article
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Unpublish article
router.put('/articles/:id/unpublish', auth, authorize('admin'), async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { status: 'draft' },
      { new: true }
    ).populate('author', 'name email');

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({
      message: 'Article unpublished',
      article
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Flag article for revision
router.put('/articles/:id/flag', auth, authorize('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      {
        status: 'flagged',
        reviewerComments: reason
      },
      { new: true }
    ).populate('author', 'name email');

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Trigger email notification
    if (article.author && article.author.email) {
      EmailService.notifyModerationAction(article.author, article, 'flagged', reason)
        .catch(err => console.error('Email notification failed:', err));
    }

    res.json({
      message: 'Article flagged for revision',
      article
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all categories
router.get('/categories', auth, authorize('admin'), async (req, res) => {
  try {
    const categories = await Article.distinct('category');

    // Get article count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Article.countDocuments({ category });
        return { name: category, count };
      })
    );

    res.json(categoriesWithCount);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all tags
router.get('/tags', auth, authorize('admin'), async (req, res) => {
  try {
    const allTags = await Article.distinct('tags');

    // Get usage count for each tag
    const tagsWithCount = await Promise.all(
      allTags.map(async (tag) => {
        const count = await Article.countDocuments({ tags: tag });
        return { name: tag, count };
      })
    );

    // Sort by usage count
    tagsWithCount.sort((a, b) => b.count - a.count);

    res.json(tagsWithCount);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create/Update category
router.post('/categories', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, description } = req.body;

    // For now, we'll just return success since categories are stored as strings
    // In a more complex system, you might have a separate Category model
    res.json({
      message: 'Category management noted',
      category: { name, description }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete category (and reassign articles)
router.delete('/categories/:name', auth, authorize('admin'), async (req, res) => {
  try {
    const { name } = req.params;
    const { reassignTo = 'Uncategorized' } = req.body;

    // Update all articles with this category
    await Article.updateMany(
      { category: name },
      { category: reassignTo }
    );

    res.json({
      message: `Category "${name}" deleted and articles reassigned to "${reassignTo}"`
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Bulk operations on articles
router.post('/articles/bulk', auth, authorize('admin'), async (req, res) => {
  try {
    const { action, articleIds, data } = req.body;

    let result;
    switch (action) {
      case 'approve':
        result = await Article.updateMany(
          { _id: { $in: articleIds } },
          { status: 'published' }
        );
        break;
      case 'reject':
        result = await Article.updateMany(
          { _id: { $in: articleIds } },
          { status: 'rejected', rejectionReason: data.reason }
        );
        break;
      case 'delete':
        result = await Article.deleteMany({ _id: { $in: articleIds } });
        break;
      case 'changeCategory':
        result = await Article.updateMany(
          { _id: { $in: articleIds } },
          { category: data.category }
        );
        break;
      default:
        return res.status(400).json({ error: 'Invalid bulk action' });
    }

    res.json({
      message: `Bulk ${action} completed`,
      modifiedCount: result.modifiedCount || result.deletedCount
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const { checkSafety } = require('../utils/contentSafety');

// Get content moderation queue
router.get('/moderation/queue', auth, authorize('admin'), async (req, res) => {
  try {
    const pendingArticles = await Article.find({ status: 'pending' })
      .populate('author', 'name email profile.picture')
      .sort({ createdAt: 1 }) // Oldest first
      .limit(20);

    // Perform safety check on each article
    const articlesWithSafety = pendingArticles.map(article => {
      const safetyResult = checkSafety(article.content, article.title);
      return {
        ...article.toObject(),
        safetyCheck: safetyResult
      };
    });

    const reportedContent = []; // Placeholder for future reporting system

    res.json({
      pendingArticles: articlesWithSafety,
      reportedContent,
      totalPending: pendingArticles.length
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// System settings (placeholder for future implementation)
router.get('/settings', auth, authorize('admin'), async (req, res) => {
  try {
    const settings = {
      siteName: 'News Portal',
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'np'],
      allowUserRegistration: true,
      requireEmailVerification: false,
      autoApproveArticles: false,
      maxFileUploadSize: '5MB',
      allowedImageTypes: ['jpeg', 'jpg', 'png', 'gif', 'webp']
    };

    res.json(settings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update system settings
router.put('/settings', auth, authorize('admin'), async (req, res) => {
  try {
    const updates = req.body;

    // In a real implementation, you'd save these to a database
    // For now, we'll just return the updated settings
    res.json({
      message: 'Settings updated successfully',
      settings: updates
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create Staff Member (Admin only)
router.post('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role, language } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role, // Admin can set any role
      language: language || 'en',
      status: 'active'
    });

    await user.save();

    res.status(201).json({
      message: 'Staff created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
