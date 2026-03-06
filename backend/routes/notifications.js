const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { withUserData } = require('../middleware/userData');

const router = express.Router();

router.use(requireAuth);
router.use(withUserData);

router.get('/', async (req, res) => {
  res.json({ notifications: req.userData.notifications || [] });
});

router.put('/:id/read', async (req, res) => {
  try {
    const notif = req.userData.notifications.id(req.params.id);
    if (notif) { notif.read = true; await req.userData.save(); }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/', async (req, res) => {
  req.userData.notifications = []; await req.userData.save();
  res.json({ success: true });
});

module.exports = router;

