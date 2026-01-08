const express = require('express');
const { User, UserData } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Add a friend
router.post('/add', requireAuth, async (req, res) => {
  try {
    const { friendCode } = req.body;
    
    if (!friendCode || typeof friendCode !== 'string') {
      return res.status(400).json({ error: 'Friend code is required' });
    }
    
    const normalizedCode = friendCode.toUpperCase().trim();
    
    if (normalizedCode.length !== 6) {
      return res.status(400).json({ error: 'Friend code must be 6 characters' });
    }

    const currentUser = await User.findById(req.session.userId);
    if (currentUser.friendCode === normalizedCode) {
      return res.status(400).json({ error: "You can't add yourself!" });
    }

    const friendUser = await User.findOne({ friendCode: normalizedCode });
    if (!friendUser) {
      return res.status(400).json({ error: 'Friend code not found. Please check the code and try again.' });
    }

    const userData = await UserData.findOne({ userId: req.session.userId });
    const alreadyFriends = userData.friends.some(f => f.friendCode === normalizedCode);
    if (alreadyFriends) {
      return res.status(400).json({ error: 'Already friends with this person!' });
    }

    // Add friend to current user
    userData.friends.push({
      username: friendUser.username,
      friendCode: friendUser.friendCode,
      addedAt: new Date()
    });
    await userData.save();

    // Also add current user to friend's list (mutual friendship)
    const friendData = await UserData.findOne({ userId: friendUser._id });
    if (friendData) {
      const alreadyAdded = friendData.friends.some(f => f.friendCode === currentUser.friendCode);
      if (!alreadyAdded) {
        friendData.friends.push({
          username: currentUser.username,
          friendCode: currentUser.friendCode,
          addedAt: new Date()
        });
        await friendData.save();
      }
    }

    res.json({ 
      success: true, 
      friend: {
        username: friendUser.username,
        friendCode: friendUser.friendCode
      }
    });
  } catch (err) {
    console.error('Add friend error:', err);
    res.status(500).json({ error: 'Failed to add friend' });
  }
});

// Remove a friend
router.delete('/:friendCode', requireAuth, async (req, res) => {
  try {
    const userData = await UserData.findOne({ userId: req.session.userId });
    userData.friends = userData.friends.filter(f => f.friendCode !== req.params.friendCode);
    await userData.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Look up a friend by code
router.get('/lookup/:friendCode', requireAuth, async (req, res) => {
  try {
    const normalizedCode = req.params.friendCode.toUpperCase().trim();
    const friendUser = await User.findOne({ friendCode: normalizedCode });
    
    if (!friendUser) {
      return res.status(404).json({ error: 'Friend code not found' });
    }
    
    res.json({
      username: friendUser.username,
      friendCode: friendUser.friendCode
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

