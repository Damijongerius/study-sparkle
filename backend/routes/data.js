const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { withUserData } = require('../middleware/userData');
const { validateAndSanitizeUserData } = require('../validators');

const router = express.Router();

router.use(requireAuth);
router.use(withUserData);

// Get user data
router.get('/', async (req, res) => {
  res.json(req.userData);
});

// Update user data
router.post('/', async (req, res) => {
  try {
    const { userId, ...updateData } = req.body;
    const { errors, sanitized } = validateAndSanitizeUserData(updateData);

    if (errors.length > 0) return res.status(400).json({ error: errors[0] });

    Object.assign(req.userData, sanitized);
    await req.userData.save();
    res.json(req.userData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

