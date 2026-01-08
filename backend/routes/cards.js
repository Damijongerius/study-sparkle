const express = require('express');
const { User, UserData } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Complete a card (notify giver if gifted)
router.post('/:cardId/complete', requireAuth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.userId);
    const data = await UserData.findOne({ userId: req.session.userId });
    if (!data) return res.status(404).json({ error: 'User not found' });
    
    const card = data.stickerCards.id(req.params.cardId);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    
    if (card.stickers.length < card.slots) {
      return res.status(400).json({ error: 'Card not yet complete' });
    }
    
    card.status = 'done';
    card.completedAt = new Date();
    await data.save();
    
    // If this was a gifted card, notify the giver
    if (card.givenBy) {
      const giver = await User.findOne({ username: card.givenBy.toLowerCase() });
      if (giver) {
        const giverData = await UserData.findOne({ userId: giver._id });
        if (giverData) {
          giverData.notifications.push({
            type: 'gift_card_completed',
            fromUsername: currentUser.username,
            cardName: card.name,
            createdAt: new Date()
          });
          await giverData.save();
        }
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

