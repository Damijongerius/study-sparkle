const mongoose = require('mongoose');

// Sub-schemas
const friendSchema = new mongoose.Schema({
  username: String,
  friendCode: String,
  addedAt: { type: Date, default: Date.now }
});

const activitySchema = new mongoose.Schema({
  type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: mongoose.Schema.Types.Mixed,
});

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  fromUsername: String,
  cardName: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const stickerCardSchema = new mongoose.Schema({
  name: String,
  slots: Number,
  goal: String,
  givenBy: String,
  givenTo: String,
  allowedCategories: [{ type: String }],
  stickers: [{ stickerId: String, earnedAt: Date }],
  status: { 
    type: String, 
    enum: ['in-progress', 'done', 'redeemed'], 
    default: 'in-progress' 
  },
  completedAt: Date,
  redeemedAt: Date,
});

// Main schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  friendCode: { type: String, required: true, unique: true, index: true },
  activeSessionId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const userDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalPoints: { type: Number, default: 0 },
  totalStudyMinutes: { type: Number, default: 0 },
  studySessions: { type: Number, default: 0 },
  ownedStickers: [{ stickerId: String, earnedAt: Date }],
  stickerCards: [stickerCardSchema],
  friends: [friendSchema],
  dailyCooldowns: { type: Map, of: String },
  activityLogs: [activitySchema],
  notifications: [notificationSchema],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const UserData = mongoose.model('UserData', userDataSchema);

module.exports = {
  User,
  UserData
};

