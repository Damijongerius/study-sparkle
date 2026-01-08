const express = require('express');
const { UserData } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Add activity log
router.post('/', requireAuth, async (req, res) => {
  try {
    let data = await UserData.findOne({ userId: req.session.userId });
    if (!data) {
      data = await UserData.create({
        userId: req.session.userId,
        stickerCards: [{ name: 'Starter Card', slots: 9, stickers: [], status: 'in-progress' }]
      });
    }
    
    // Validate and sanitize activity log
    const activity = {
      type: String(req.body.type || '').substring(0, 50),
      timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
      details: typeof req.body.details === 'object' && req.body.details !== null 
        ? req.body.details 
        : {},
    };
    
    data.activityLogs.unshift(activity);
    if (data.activityLogs.length > 500) data.activityLogs = data.activityLogs.slice(0, 500);
    await data.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Activity log error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

