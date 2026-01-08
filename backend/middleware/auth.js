const { User } = require('../models');

const requireAuth = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  // Verify this is still the active session
  try {
    const user = await User.findById(req.session.userId);
    if (!user || user.activeSessionId !== req.session.id) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Session expired - logged in elsewhere' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Session verification failed' });
  }
  
  next();
};

module.exports = { requireAuth };

