const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { withUserData } = require('../middleware/userData');

const router = express.Router();

router.use(requireAuth);
router.use(withUserData);

router.post('/deduct', async (req, res) => {
  try {
    const { amount, reason } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
    
    req.userData.totalPoints = Math.max(0, req.userData.totalPoints - amount);
    req.userData.activityLogs.unshift({ type: reason || 'point_deduction', timestamp: new Date(), details: { points: -amount } });
    if (req.userData.activityLogs.length > 500) req.userData.activityLogs = req.userData.activityLogs.slice(0, 500);
    
    await req.userData.save();
    res.json({ success: true, newTotal: req.userData.totalPoints });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

