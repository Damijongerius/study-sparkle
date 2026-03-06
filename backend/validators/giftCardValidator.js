const { VALID_CATEGORIES } = require('./constants');

const validateGiftCard = (data) => {
  const errors = [];
  const { toUsername, name, goal, slots, allowedCategories } = data;
  if (!toUsername || !name) errors.push('Recipient and card name are required');
  if (!slots || slots < 6 || slots > 25) errors.push('Slots must be between 6 and 25');
  if (name && name.length > 40) errors.push('Card name must be 40 characters or less');
  if (goal && goal.length > 150) errors.push('Goal must be 150 characters or less');
  if (allowedCategories && Array.isArray(allowedCategories)) {
    for (const cat of allowedCategories) if (!VALID_CATEGORIES.includes(cat)) errors.push(`Invalid category: ${cat}`);
  }
  return errors;
};

module.exports = { validateGiftCard };
