const express = require('express');
const bcrypt = require('bcryptjs');
const { User, UserData } = require('../models');
const { generateUniqueFriendCode } = require('../utils/friendCode');

const router = express.Router();

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || username.length < 2 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be 2-20 characters' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }
    
    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const friendCode = await generateUniqueFriendCode();

    const user = await User.create({
      username: username.toLowerCase(),
      passwordHash,
      friendCode
    });

    // Create user data
    await UserData.create({
      userId: user._id,
      stickerCards: [{ name: 'Starter Card', slots: 9, stickers: [], status: 'in-progress' }]
    });

    // Set session
    req.session.userId = user._id;
    req.session.username = user.username;

    // Store session ID on user to enforce single session
    user.activeSessionId = req.session.id;
    await user.save();

    res.json({
      success: true,
      user: { username: user.username, friendCode: user.friendCode }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Invalidate any existing session
    if (user.activeSessionId && req.redisClient) {
      try {
        await req.redisClient.del(`sess:${user.activeSessionId}`);
      } catch (e) {
        console.log('Could not invalidate old session:', e);
      }
    }

    // Set new session
    req.session.userId = user._id;
    req.session.username = user.username;

    // Store new session ID
    user.activeSessionId = req.session.id;
    await user.save();

    const userData = await UserData.findOne({ userId: user._id });

    res.json({
      success: true,
      user: { username: user.username, friendCode: user.friendCode },
      friends: userData?.friends || []
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    // Clear activeSessionId on user
    if (req.session.userId) {
      await User.findByIdAndUpdate(req.session.userId, { activeSessionId: null });
    }
  } catch (e) {
    console.error('Error clearing session:', e);
  }
  
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// Get current user
router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.json({ user: null });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.json({ user: null });
    }

    // Check if this is still the active session
    if (user.activeSessionId !== req.session.id) {
      req.session.destroy(() => {});
      return res.json({ user: null, error: 'Session expired' });
    }

    const userData = await UserData.findOne({ userId: user._id });

    res.json({
      user: { username: user.username, friendCode: user.friendCode },
      friends: userData?.friends || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

