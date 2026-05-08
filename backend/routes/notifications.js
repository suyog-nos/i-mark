const express = require('express');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const filter = { recipient: req.user._id };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate('sender', 'name profile.picture')
      .populate('relatedArticle', 'title slug')
      .populate('relatedUser', 'name profile.picture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      unreadCount
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get notification preferences (placeholder for future implementation)
router.get('/preferences', auth, async (req, res) => {
  try {
    // In a real implementation, you'd have a separate model for notification preferences
    const preferences = {
      newArticles: true,
      articleApproved: true,
      articleRejected: true,
      newComments: true,
      newLikes: false,
      newSubscribers: true,
      systemAnnouncements: true,
      emailNotifications: false,
      pushNotifications: true
    };

    res.json(preferences);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update notification preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const preferences = req.body;
    
    // In a real implementation, you'd save these to the user model or a separate preferences model
    res.json({
      message: 'Notification preferences updated',
      preferences
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
