const { VALID_CATEGORIES } = require('./constants');
const { sanitizeStickers } = require('./stickerSanitizer');
const { sanitizePlanner } = require('./plannerSanitizer');
const { sanitizeAgenda } = require('./agendaSanitizer');

const validateAndSanitizeUserData = (updateData) => {
  const errors = []; const sanitized = {};
  const validateNumeric = (val, max, name) => {
    if (val === undefined) return;
    const n = Number(val);
    if (isNaN(n) || n < 0 || n > max) errors.push(`Invalid ${name}`);
    else sanitized[name] = n;
  };
  validateNumeric(updateData.totalPoints, 1000000, 'totalPoints');
  validateNumeric(updateData.totalStudyMinutes, 1000000, 'totalStudyMinutes');
  validateNumeric(updateData.studySessions, 100000, 'studySessions');

  sanitizeStickers(updateData, sanitized);
  sanitizePlanner(updateData, sanitized);
  sanitizeAgenda(updateData, sanitized);

  if (updateData.dailyCooldowns && typeof updateData.dailyCooldowns === 'object') {
    const cd = {}; for (const [k, v] of Object.entries(updateData.dailyCooldowns)) if (String(k).length <= 100 && String(v).length <= 50) cd[k.substring(0, 100)] = v.substring(0, 50);
    sanitized.dailyCooldowns = cd;
  }
  if (updateData.activityLogs && Array.isArray(updateData.activityLogs)) {
    sanitized.activityLogs = updateData.activityLogs.slice(0, 500).map(l => ({ type: String(l.type || '').substring(0, 50), timestamp: l.timestamp ? new Date(l.timestamp) : new Date(), details: typeof l.details === 'object' ? l.details : {} }));
  }
  if (updateData.notifications && Array.isArray(updateData.notifications)) {
    sanitized.notifications = updateData.notifications.slice(0, 1000).map(n => ({ type: String(n.type || '').substring(0, 50), fromUsername: String(n.fromUsername || '').substring(0, 50), cardName: String(n.cardName || '').substring(0, 40), read: Boolean(n.read), createdAt: n.createdAt ? new Date(n.createdAt) : new Date() }));
  }
  if (updateData.dailyIntent && typeof updateData.dailyIntent === 'object') {
    sanitized.dailyIntent = { energy: String(updateData.dailyIntent.energy).substring(0, 50), persona: String(updateData.dailyIntent.persona).substring(0, 50), time: String(updateData.dailyIntent.time).substring(0, 50), date: String(updateData.dailyIntent.date).substring(0, 10) };
  }

  return { errors, sanitized };
};

module.exports = { validateAndSanitizeUserData };
