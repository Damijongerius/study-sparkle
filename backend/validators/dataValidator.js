const VALID_CATEGORIES = ['animals', 'food', 'nature', 'sparkles', 'space', 'cozy', 'sports', 'music', 'weather'];

const validateAndSanitizeUserData = (updateData) => {
  const errors = [];
  const sanitized = {};

  // Validate numeric fields
  if (updateData.totalPoints !== undefined) {
    const points = Number(updateData.totalPoints);
    if (isNaN(points) || points < 0 || points > 1000000) {
      errors.push('Invalid totalPoints value');
    } else {
      sanitized.totalPoints = points;
    }
  }

  if (updateData.totalStudyMinutes !== undefined) {
    const minutes = Number(updateData.totalStudyMinutes);
    if (isNaN(minutes) || minutes < 0 || minutes > 1000000) {
      errors.push('Invalid totalStudyMinutes value');
    } else {
      sanitized.totalStudyMinutes = minutes;
    }
  }

  if (updateData.studySessions !== undefined) {
    const sessions = Number(updateData.studySessions);
    if (isNaN(sessions) || sessions < 0 || sessions > 100000) {
      errors.push('Invalid studySessions value');
    } else {
      sanitized.studySessions = sessions;
    }
  }

  // Validate ownedStickers array
  if (updateData.ownedStickers !== undefined) {
    if (!Array.isArray(updateData.ownedStickers)) {
      errors.push('ownedStickers must be an array');
    } else if (updateData.ownedStickers.length > 10000) {
      errors.push('Too many ownedStickers');
    } else {
      sanitized.ownedStickers = updateData.ownedStickers.map(s => ({
        stickerId: String(s.stickerId || '').substring(0, 100),
        earnedAt: s.earnedAt ? new Date(s.earnedAt) : new Date(),
      }));
    }
  }

  // Validate stickerCards array
  if (updateData.stickerCards !== undefined) {
    if (!Array.isArray(updateData.stickerCards)) {
      errors.push('stickerCards must be an array');
    } else if (updateData.stickerCards.length > 1000) {
      errors.push('Too many stickerCards');
    } else {
      sanitized.stickerCards = updateData.stickerCards.map(card => ({
        name: String(card.name || '').substring(0, 40),
        slots: Math.min(Math.max(Number(card.slots) || 9, 1), 25),
        goal: card.goal ? String(card.goal).substring(0, 150) : undefined,
        givenBy: card.givenBy ? String(card.givenBy).substring(0, 50) : undefined,
        givenTo: card.givenTo ? String(card.givenTo).substring(0, 50) : undefined,
        allowedCategories: Array.isArray(card.allowedCategories) 
          ? card.allowedCategories.filter(cat => VALID_CATEGORIES.includes(cat)).slice(0, 10)
          : [],
        stickers: Array.isArray(card.stickers) 
          ? card.stickers.slice(0, 100).map(s => ({
              stickerId: String(s.stickerId || '').substring(0, 100),
              earnedAt: s.earnedAt ? new Date(s.earnedAt) : new Date(),
            }))
          : [],
        status: ['in-progress', 'done', 'redeemed'].includes(card.status) ? card.status : 'in-progress',
        completedAt: card.completedAt ? new Date(card.completedAt) : undefined,
        redeemedAt: card.redeemedAt ? new Date(card.redeemedAt) : undefined,
      }));
    }
  }

  // Validate dailyCooldowns
  if (updateData.dailyCooldowns !== undefined) {
    if (typeof updateData.dailyCooldowns !== 'object' || Array.isArray(updateData.dailyCooldowns)) {
      errors.push('dailyCooldowns must be an object');
    } else {
      const cooldowns = {};
      for (const [key, value] of Object.entries(updateData.dailyCooldowns)) {
        if (String(key).length <= 100 && String(value).length <= 50) {
          cooldowns[String(key).substring(0, 100)] = String(value).substring(0, 50);
        }
      }
      sanitized.dailyCooldowns = cooldowns;
    }
  }

  // Validate activityLogs array
  if (updateData.activityLogs !== undefined) {
    if (!Array.isArray(updateData.activityLogs)) {
      errors.push('activityLogs must be an array');
    } else {
      const logs = updateData.activityLogs.slice(0, 500);
      sanitized.activityLogs = logs.map(log => ({
        type: String(log.type || '').substring(0, 50),
        timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
        details: typeof log.details === 'object' && log.details !== null ? log.details : {},
      }));
    }
  }

  // Validate notifications array
  if (updateData.notifications !== undefined) {
    if (!Array.isArray(updateData.notifications)) {
      errors.push('notifications must be an array');
    } else {
      const notifs = updateData.notifications.slice(0, 1000);
      sanitized.notifications = notifs.map(notif => ({
        type: String(notif.type || '').substring(0, 50),
        fromUsername: String(notif.fromUsername || '').substring(0, 50),
        cardName: String(notif.cardName || '').substring(0, 40),
        read: Boolean(notif.read),
        createdAt: notif.createdAt ? new Date(notif.createdAt) : new Date(),
      }));
    }
  }

  return { errors, sanitized };
};

const validateGiftCard = (data) => {
  const errors = [];
  const { toUsername, name, goal, slots, allowedCategories } = data;

  if (!toUsername || !name) {
    errors.push('Recipient and card name are required');
  }

  if (!slots || slots < 6 || slots > 25) {
    errors.push('Slots must be between 6 and 25');
  }

  if (name && name.length > 40) {
    errors.push('Card name must be 40 characters or less');
  }

  if (goal && goal.length > 150) {
    errors.push('Goal must be 150 characters or less');
  }

  if (allowedCategories && Array.isArray(allowedCategories)) {
    for (const cat of allowedCategories) {
      if (!VALID_CATEGORIES.includes(cat)) {
        errors.push(`Invalid category: ${cat}`);
      }
    }
  }

  return errors;
};

module.exports = {
  validateAndSanitizeUserData,
  validateGiftCard,
  VALID_CATEGORIES
};

