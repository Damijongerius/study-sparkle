const express = require('express');
const { User, UserData } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { validateGiftCard } = require('../validators/dataValidator');

const router = express.Router();

// Send a gift card
router.post('/', requireAuth, async (req, res) => {
  try {
    const { toUsername, name, goal, slots, allowedCategories } = req.body;
    
    // Validate inputs
    const validationErrors = validateGiftCard({ toUsername, name, goal, slots, allowedCategories });
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors[0] });
    }

    const currentUser = await User.findById(req.session.userId);
    
    const recipient = await User.findOne({ username: toUsername.toLowerCase() });
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient not found' });
    }

    // Check if they are actually friends
    const currentUserData = await UserData.findOne({ userId: req.session.userId });
    const isFriend = currentUserData.friends.some(f => f.username === recipient.username);
    if (!isFriend) {
      return res.status(400).json({ error: 'You can only gift cards to friends' });
    }

    const recipientData = await UserData.findOne({ userId: recipient._id });
    if (!recipientData) {
      return res.status(400).json({ error: 'Recipient data not found' });
    }

    // Add gift card at the beginning of their cards
    recipientData.stickerCards.unshift({
      name,
      goal: goal || undefined,
      slots,
      givenBy: currentUser.username,
      allowedCategories: allowedCategories || [],
      stickers: [],
      status: 'in-progress'
    });
    await recipientData.save();

    // Add activity log for sender
    currentUserData.activityLogs.unshift({
      type: 'gift_sent',
      timestamp: new Date(),
      details: {
        cardName: name,
        toUsername: recipient.username
      }
    });
    await currentUserData.save();

    res.json({ success: true });
  } catch (err) {
    console.error('Gift card error:', err);
    res.status(500).json({ error: 'Failed to send gift card' });
  }
});

module.exports = router;

