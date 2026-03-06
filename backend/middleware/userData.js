const { UserData } = require('../models');

const withUserData = async (req, res, next) => {
  try {
    let data = await UserData.findOne({ userId: req.session.userId });
    if (!data) {
      data = await UserData.create({
        userId: req.session.userId,
        stickerCards: [{ name: 'Starter Card', slots: 9, stickers: [], status: 'in-progress' }]
      });
    }
    req.userData = data;
    next();
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch or create user data' });
  }
};

module.exports = { withUserData };
