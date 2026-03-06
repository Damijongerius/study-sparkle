const express = require('express');
const { User, UserData } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { withUserData } = require('../middleware/userData');

const router = express.Router();

router.use(requireAuth);
router.use(withUserData);

// Add a friend
router.post('/add', async (req, res) => {
  try {
    const { friendCode } = req.body;
    if (!friendCode) return res.status(400).json({ error: 'Friend code is required' });
    const normalizedCode = friendCode.toUpperCase().trim();
    
    const currentUser = await User.findById(req.session.userId);
    if (currentUser.friendCode === normalizedCode) return res.status(400).json({ error: "You can't add yourself!" });

    const friendUser = await User.findOne({ friendCode: normalizedCode });
    if (!friendUser) return res.status(400).json({ error: 'Friend code not found' });

    if (req.userData.friends.some(f => f.friendCode === normalizedCode)) return res.status(400).json({ error: 'Already friends!' });

    req.userData.friends.push({ username: friendUser.username, friendCode: friendUser.friendCode, addedAt: new Date() });
    await req.userData.save();

    const friendData = await UserData.findOne({ userId: friendUser._id });
    if (friendData && !friendData.friends.some(f => f.friendCode === currentUser.friendCode)) {
      friendData.friends.push({ username: currentUser.username, friendCode: currentUser.friendCode, addedAt: new Date() });
      await friendData.save();
    }

    res.json({ success: true, friend: { username: friendUser.username, friendCode: friendUser.friendCode } });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// Remove a friend
router.delete('/:friendCode', async (req, res) => {
  req.userData.friends = req.userData.friends.filter(f => f.friendCode !== req.params.friendCode);
  await req.userData.save();
  res.json({ success: true });
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

