const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'reader', language = 'en' } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@imark.com';

    // Prevent anyone from registering as admin directly via this route
    if (role === 'admin' && email.toLowerCase() !== adminEmail.toLowerCase()) {
      return res.status(403).json({ error: 'Cannot register as admin.' });
    }

    // Check for reserved email patterns (blocked if not the hardcoded admin)
    const isReserved = email.toLowerCase().startsWith('admin@') ||
      email.toLowerCase().startsWith('administrator@');

    if (isReserved && email.toLowerCase() !== adminEmail.toLowerCase()) {
      return res.status(403).json({ error: 'This email is reserved.' });
    }

    // Check if name contains 'admin' (case insensitive)
    if (name.toLowerCase().includes('admin') && email.toLowerCase() !== adminEmail.toLowerCase()) {
      return res.status(403).json({ error: 'The name "admin" is reserved.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      language
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        language: user.language
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Account is inactive or blocked' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        language: user.language,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('subscriptions', 'name email profile.picture');

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['name', 'profile', 'language'];
    const actualUpdates = {};

    // Filter allowed updates
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        actualUpdates[key] = updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      actualUpdates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Subscribe to publisher
router.post('/subscribe/:publisherId', auth, async (req, res) => {
  try {
    const { publisherId } = req.params;

    // Check if publisher exists and is a publisher
    const publisher = await User.findById(publisherId);
    if (!publisher || publisher.role !== 'publisher') {
      return res.status(404).json({ error: 'Publisher not found' });
    }

    // Add subscription if not already subscribed
    if (!req.user.subscriptions.includes(publisherId)) {
      req.user.subscriptions.push(publisherId);
      await req.user.save();
    }

    res.json({ message: 'Subscribed successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Unsubscribe from publisher
router.delete('/unsubscribe/:publisherId', auth, async (req, res) => {
  try {
    const { publisherId } = req.params;

    req.user.subscriptions = req.user.subscriptions.filter(
      sub => sub.toString() !== publisherId
    );
    await req.user.save();

    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
