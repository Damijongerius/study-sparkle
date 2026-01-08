const express = require('express');
const { UserData } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { validateAndSanitizeUserData } = require('../validators/dataValidator');

const router = express.Router();

// Get user data
router.get('/', requireAuth, async (req, res) => {
  try {
    let data = await UserData.findOne({ userId: req.session.userId });
    if (!data) {
      data = await UserData.create({
        userId: req.session.userId,
        stickerCards: [{ name: 'Starter Card', slots: 9, stickers: [], status: 'in-progress' }]
      });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user data
router.put('/', requireAuth, async (req, res) => {
  try {
    let data = await UserData.findOne({ userId: req.session.userId });
    if (!data) {
      data = await UserData.create({
        userId: req.session.userId,
        stickerCards: [{ name: 'Starter Card', slots: 9, stickers: [], status: 'in-progress' }]
      });
    }

    // Validate and sanitize input
    const { userId, ...updateData } = req.body;
    const { errors, sanitized } = validateAndSanitizeUserData(updateData);

    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0] });
    }

    // Apply sanitized data
    Object.assign(data, sanitized);
    await data.save();
    res.json(data);
  } catch (err) {
    console.error('Update data error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

