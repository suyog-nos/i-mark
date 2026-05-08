const express = require('express');
const User = require('../models/User');
const Article = require('../models/Article');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('subscriptions', 'name profile.picture');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's published articles count
    const articlesCount = await Article.countDocuments({
      author: user._id,
      status: 'published'
    });

    res.json({
      ...user.toObject(),
      articlesCount
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user role (Admin only)
router.put('/:id/role', auth, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['admin', 'publisher', 'reader'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user status (Admin only)
router.put('/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'inactive', 'blocked'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete user (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get publishers list
router.get('/publishers/list', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const filter = { role: 'publisher', status: 'active' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'profile.bio': { $regex: search, $options: 'i' } }
      ];
    }

    const publishers = await User.find(filter)
      .select('name email profile createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get stats for each publisher
    const publishersWithStats = await Promise.all(
      publishers.map(async (publisher) => {
        const [articlesCount, followersCount] = await Promise.all([
          Article.countDocuments({
            author: publisher._id,
            status: 'published'
          }),
          User.countDocuments({
            subscriptions: publisher._id
          })
        ]);

        return {
          ...publisher.toObject(),
          articlesCount,
          followersCount
        };
      })
    );

    const total = await User.countDocuments(filter);

    res.json({
      publishers: publishersWithStats,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user analytics (Admin only)
router.get('/:id/analytics', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let analytics = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    };

    if (user.role === 'publisher') {
      // Get publisher-specific analytics
      const articles = await Article.find({ author: user._id });

      const totalViews = articles.reduce((sum, article) => sum + article.views, 0);
      const totalLikes = articles.reduce((sum, article) => sum + article.likes.length, 0);
      const totalShares = articles.reduce((sum, article) => sum + article.shares, 0);
      const totalComments = articles.reduce((sum, article) => sum + article.comments.length, 0);

      const followersCount = await User.countDocuments({ subscriptions: user._id });

      analytics.publisherStats = {
        totalArticles: articles.length,
        publishedArticles: articles.filter(a => a.status === 'published').length,
        pendingArticles: articles.filter(a => a.status === 'pending').length,
        draftArticles: articles.filter(a => a.status === 'draft').length,
        rejectedArticles: articles.filter(a => a.status === 'rejected').length,
        totalViews,
        totalLikes,
        totalShares,
        totalComments,
        followersCount
      };
    } else if (user.role === 'reader') {
      // Get reader-specific analytics
      analytics.readerStats = {
        subscriptions: user.subscriptions.length,
        bookmarksCount: user.bookmarks.length
      };
    }

    res.json(analytics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get platform analytics (Admin only)
router.get('/analytics/platform', auth, authorize('admin'), async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const publisherCount = await User.countDocuments({ role: 'publisher' });
    const readerCount = await User.countDocuments({ role: 'reader' });

    // Article statistics
    const totalArticles = await Article.countDocuments();
    const publishedArticles = await Article.countDocuments({ status: 'published' });
    const pendingArticles = await Article.countDocuments({ status: 'pending' });
    const draftArticles = await Article.countDocuments({ status: 'draft' });
    const rejectedArticles = await Article.countDocuments({ status: 'rejected' });

    // Get total views, likes, shares
    const articles = await Article.find({});
    const totalViews = articles.reduce((sum, article) => sum + article.views, 0);
    const totalLikes = articles.reduce((sum, article) => sum + article.likes.length, 0);
    const totalShares = articles.reduce((sum, article) => sum + article.shares, 0);
    const totalComments = articles.reduce((sum, article) => sum + article.comments.length, 0);

    // Get categories
    const categories = await Article.distinct('category');

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const recentArticles = await Article.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: adminCount,
        publishers: publisherCount,
        readers: readerCount,
        recent: recentUsers
      },
      articles: {
        total: totalArticles,
        published: publishedArticles,
        pending: pendingArticles,
        draft: draftArticles,
        rejected: rejectedArticles,
        recent: recentArticles
      },
      engagement: {
        totalViews,
        totalLikes,
        totalShares,
        totalComments
      },
      categories,
      lastUpdated: new Date()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
