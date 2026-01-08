const crypto = require('crypto');
const { User } = require('../models');

const generateUniqueFriendCode = async () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    let code = '';
    // Use crypto for better randomness
    const randomBytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(randomBytes[i] % chars.length);
    }
    
    // Check if code already exists
    const existing = await User.findOne({ friendCode: code });
    if (!existing) {
      return code;
    }
    attempts++;
  }
  
  // Fallback: use timestamp-based code if random fails
  const timestamp = Date.now().toString(36).toUpperCase();
  return timestamp.slice(-6).padStart(6, 'X');
};

module.exports = { generateUniqueFriendCode };

