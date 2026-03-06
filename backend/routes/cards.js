const express = require('express');
const { User, UserData } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { withUserData } = require('../middleware/userData');

const router = express.Router();

router.use(requireAuth);
router.use(withUserData);

router.post('/:cardId/complete', async (req, res) => {
  try {
    const card = req.userData.stickerCards.id(req.params.cardId);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    if (card.stickers.length < card.slots) return res.status(400).json({ error: 'Not complete' });
    
    card.status = 'done';
    card.completedAt = new Date();
    await req.userData.save();
    
    if (card.givenBy) {
      const giver = await User.findOne({ username: card.givenBy.toLowerCase() });
      const giverData = giver ? await UserData.findOne({ userId: giver._id }) : null;
      if (giverData) {
        giverData.notifications.push({ type: 'gift_card_completed', fromUsername: req.session.username, cardName: card.name, createdAt: new Date() });
        await giverData.save();
      }
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

