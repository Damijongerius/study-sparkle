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

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed'], 
    default: 'pending' 
  },
  dependencies: [String], // Titles or IDs of pre-requisite tasks
  externalLink: String,
  id: { type: String, required: true },
  startDate: Date,
  endDate: Date,
  estimatedHours: Number,
  row: Number,
  order: Number,
  linkedTaskId: String,
});

const planSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed'], 
    default: 'pending' 
  },
  tasks: [taskSchema],
  id: { type: String, required: true },
  examDate: Date,
  startDate: Date,
  endDate: Date,
  type: { type: String, enum: ['flow', 'exam', 'long-term'], default: 'flow' },
  enforceDependencies: { type: Boolean, default: false }
});

// Main schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String }, // Optional for Google users
  googleId: { type: String, unique: true, sparse: true },
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
  plans: [planSchema],
  availability: [{
    day: Number,
    startHour: Number,
    category: { type: String, enum: ['study', 'class', 'break', 'sleep', 'other'], default: 'study' }
  }],
  agendaItems: [{
    id: String,
    title: String,
    day: Number,
    date: String,
    startTime: Number,
    endTime: Number,
    type: { type: String, enum: ['task', 'custom'], default: 'custom' },
    actionId: String,
    calendarId: String
  }],
  agendaSettings: {
    actions: [{
        id: String,
        label: String,
        color: String,
        isSystem: { type: Boolean, default: false }
    }],
    outOfAgenda: [{
        day: Number,
        wakeTime: Number,
        sleepTime: Number
    }],
    calendars: [{
        id: String,
        name: String,
        color: String,
        url: String,
        isExternal: { type: Boolean, default: false }
    }]
  },
  friends: [friendSchema],
  dailyCooldowns: { type: Map, of: String },
  activityLogs: [activitySchema],
  notifications: [notificationSchema],
  dailyIntent: {
    energy: String,
    persona: String,
    time: String,
    date: String
  },
}, { timestamps: true });

const scannedPDFSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: String,
  originalName: String,
  status: { 
    type: String, 
    enum: ['processing', 'completed', 'failed'], 
    default: 'processing' 
  },
  progress: { type: Number, default: 0 },
  statusMessage: { type: String, default: '' },
  currentStage: { type: String, default: 'metadata' },
  indexedAt: { type: Date, default: Date.now },
  chapters: [{
    title: String,
    isAiDissected: { type: Boolean, default: false },
    blocks: [{
      type: { type: String, enum: ['text', 'image'], required: true },
      content: String,
      style: {
        isBold: { type: Boolean, default: false },
        isSpecial: { type: Boolean, default: false }
      },
      metadata: mongoose.Schema.Types.Mixed,
      page: Number,
      imageDescription: String
    }]
  }],
  rawChapters: [{
    title: String,
    blocks: [{
      type: { type: String, enum: ['text', 'image'], required: true },
      content: String,
      style: {
        isBold: { type: Boolean, default: false },
        isSpecial: { type: Boolean, default: false }
      },
      metadata: mongoose.Schema.Types.Mixed,
      page: Number
    }]
  }],
  images: [{
    name: String,
    path: String,
    element_index: Number
  }],
  metadata: {
    pageCount: Number,
    totalBlocks: Number,
    source: String
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const UserData = mongoose.model('UserData', userDataSchema);
const ScannedPDF = mongoose.model('ScannedPDF', scannedPDFSchema);

module.exports = {
  User,
  UserData,
  ScannedPDF
};

