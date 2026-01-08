const express = require('express');
const { UserData } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get notifications
router.get('/', requireAuth, async (req, res) => {
  try {
    const data = await UserData.findOne({ userId: req.session.userId });
    res.json({ notifications: data?.notifications || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.put('/:id/read', requireAuth, async (req, res) => {
  try {
    const data = await UserData.findOne({ userId: req.session.userId });
    if (!data) return res.status(404).json({ error: 'User not found' });
    
    const notification = data.notifications.id(req.params.id);
    if (notification) {
      notification.read = true;
      await data.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear all notifications
router.delete('/', requireAuth, async (req, res) => {
  try {
    const data = await UserData.findOne({ userId: req.session.userId });
    if (data) {
      data.notifications = [];
      await data.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

