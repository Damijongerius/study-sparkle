const express = require('express');
const { UserData } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Deduct points (for pause/reset penalties)
router.post('/deduct', requireAuth, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    
    if (!amount || amount <= 0 || amount > 100) {
      return res.status(400).json({ error: 'Invalid deduction amount' });
    }
    
    let data = await UserData.findOne({ userId: req.session.userId });
    if (!data) {
      return res.status(404).json({ error: 'User data not found' });
    }
    
    data.totalPoints = Math.max(0, data.totalPoints - amount);
    data.activityLogs.unshift({
      type: reason || 'point_deduction',
      timestamp: new Date(),
      details: { points: -amount }
    });
    if (data.activityLogs.length > 500) data.activityLogs = data.activityLogs.slice(0, 500);
    
    await data.save();
    res.json({ success: true, newTotal: data.totalPoints });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

