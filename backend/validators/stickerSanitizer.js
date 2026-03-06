const { VALID_CATEGORIES } = require('./constants');

const sanitizeStickers = (data, sanitized) => {
  if (Array.isArray(data.ownedStickers)) {
    sanitized.ownedStickers = data.ownedStickers.slice(0, 10000).map(s => ({
      stickerId: String(s.stickerId || '').substring(0, 100),
      earnedAt: s.earnedAt ? new Date(s.earnedAt) : new Date()
    }));
  }
  if (Array.isArray(data.stickerCards)) {
    sanitized.stickerCards = data.stickerCards.slice(0, 1000).map(c => ({
      name: String(c.name || '').substring(0, 40),
      slots: Math.min(Math.max(Number(c.slots) || 9, 1), 25),
      goal: c.goal ? String(c.goal).substring(0, 150) : undefined,
      allowedCategories: Array.isArray(c.allowedCategories) ? c.allowedCategories.filter(cat => VALID_CATEGORIES.includes(cat)).slice(0, 10) : [],
      stickers: Array.isArray(c.stickers) ? c.stickers.slice(0, 100).map(s => ({ stickerId: String(s.stickerId || '').substring(0, 100), earnedAt: s.earnedAt ? new Date(s.earnedAt) : new Date() })) : [],
      status: ['in-progress', 'done', 'redeemed'].includes(c.status) ? c.status : 'in-progress',
      completedAt: c.completedAt ? new Date(c.completedAt) : undefined,
      redeemedAt: c.redeemedAt ? new Date(c.redeemedAt) : undefined,
    }));
  }
};

module.exports = { sanitizeStickers };
