const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { withUserData } = require('../middleware/userData');

const router = express.Router();

router.use(requireAuth);
router.use(withUserData);

router.post('/', async (req, res) => {
  try {
    const activity = {
      type: String(req.body.type || '').substring(0, 50),
      timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
      details: typeof req.body.details === 'object' ? req.body.details : {},
    };
    req.userData.activityLogs.unshift(activity);
    if (req.userData.activityLogs.length > 500) req.userData.activityLogs = req.userData.activityLogs.slice(0, 500);
    await req.userData.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

