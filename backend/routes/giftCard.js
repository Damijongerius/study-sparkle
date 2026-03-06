const express = require('express');
const { User, UserData } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { withUserData } = require('../middleware/userData');
const { validateGiftCard } = require('../validators');

const router = express.Router();

router.use(requireAuth);
router.use(withUserData);

router.post('/', async (req, res) => {
  try {
    const { toUsername, name, goal, slots, allowedCategories } = req.body;
    const errors = validateGiftCard({ toUsername, name, goal, slots, allowedCategories });
    if (errors.length > 0) return res.status(400).json({ error: errors[0] });

    const recipient = await User.findOne({ username: toUsername.toLowerCase() });
    if (!recipient) return res.status(400).json({ error: 'Recipient not found' });

    if (!req.userData.friends.some(f => f.username === recipient.username)) {
      return res.status(400).json({ error: 'Must be friends to gift' });
    }

    const recipientData = await UserData.findOne({ userId: recipient._id });
    if (!recipientData) return res.status(400).json({ error: 'Recipient data error' });

    recipientData.stickerCards.unshift({ name, goal, slots, givenBy: req.session.username, allowedCategories: allowedCategories || [], stickers: [], status: 'in-progress' });
    await recipientData.save();

    req.userData.activityLogs.unshift({ type: 'gift_sent', timestamp: new Date(), details: { cardName: name, toUsername: recipient.username } });
    await req.userData.save();

    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

