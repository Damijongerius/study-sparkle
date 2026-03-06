const express = require('express');
const passport = require('passport');
const { User } = require('../../models');
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), async (req, res) => {
  try {
    req.session.userId = req.user._id; req.session.username = req.user.username;
    await User.findByIdAndUpdate(req.user._id, { activeSessionId: req.session.id });
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  } catch (err) { res.redirect('/login?error=oauth_failed'); }
});

module.exports = router;
