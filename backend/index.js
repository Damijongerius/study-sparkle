const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const bcrypt = require('bcryptjs');

const app = express();

// Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.connect().catch(console.error);
redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Session middleware with Redis store
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  }
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/studybuddy')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  friendCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

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

const stickerCardSchema = new mongoose.Schema({
  name: String,
  slots: Number,
  goal: String,
  givenBy: String,
  givenTo: String,
  stickers: [{ stickerId: String, earnedAt: Date }],
  status: { type: String, enum: ['in-progress', 'done', 'redeemed'], default: 'in-progress' },
  completedAt: Date,
  redeemedAt: Date,
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
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const UserData = mongoose.model('UserData', userDataSchema);

// Helper: generate friend code
const generateFriendCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || username.length < 2) {
      return res.status(400).json({ error: 'Username must be at least 2 characters' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const friendCode = generateFriendCode();

    const user = await User.create({
      username: username.toLowerCase(),
      passwordHash,
      friendCode
    });

    // Create user data
    await UserData.create({
      userId: user._id,
      stickerCards: [{ name: 'Starter Card', slots: 9, stickers: [], status: 'in-progress' }]
    });

    // Set session
    req.session.userId = user._id;
    req.session.username = user.username;

    res.json({
      success: true,
      user: { username: user.username, friendCode: user.friendCode }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Set session
    req.session.userId = user._id;
    req.session.username = user.username;

    res.json({
      success: true,
      user: { username: user.username, friendCode: user.friendCode }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

app.get('/api/auth/me', async (req, res) => {
  if (!req.session.userId) {
    return res.json({ user: null });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.json({ user: null });
    }

    const userData = await UserData.findOne({ userId: user._id });

    res.json({
      user: { username: user.username, friendCode: user.friendCode },
      friends: userData?.friends || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Data Routes (protected)
app.get('/api/data', requireAuth, async (req, res) => {
  try {
    let data = await UserData.findOne({ userId: req.session.userId });
    if (!data) {
      data = await UserData.create({
        userId: req.session.userId,
        stickerCards: [{ name: 'Starter Card', slots: 9, stickers: [], status: 'in-progress' }]
      });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/data', requireAuth, async (req, res) => {
  try {
    let data = await UserData.findOne({ userId: req.session.userId });
    if (!data) {
      data = new UserData({ ...req.body, userId: req.session.userId });
    } else {
      const { userId, ...updateData } = req.body;
      Object.assign(data, updateData);
    }
    await data.save();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/activity', requireAuth, async (req, res) => {
  try {
    let data = await UserData.findOne({ userId: req.session.userId });
    if (!data) {
      data = await UserData.create({
        userId: req.session.userId,
        stickerCards: [{ name: 'Starter Card', slots: 9, stickers: [], status: 'in-progress' }]
      });
    }
    data.activityLogs.unshift(req.body);
    if (data.activityLogs.length > 500) data.activityLogs = data.activityLogs.slice(0, 500);
    await data.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Friends Routes
app.post('/api/friends/add', requireAuth, async (req, res) => {
  try {
    const { friendCode } = req.body;
    const normalizedCode = friendCode.toUpperCase().trim();

    const currentUser = await User.findById(req.session.userId);
    if (currentUser.friendCode === normalizedCode) {
      return res.status(400).json({ error: "You can't add yourself!" });
    }

    const friendUser = await User.findOne({ friendCode: normalizedCode });
    if (!friendUser) {
      return res.status(400).json({ error: 'Friend code not found' });
    }

    const userData = await UserData.findOne({ userId: req.session.userId });
    const alreadyFriends = userData.friends.some(f => f.friendCode === normalizedCode);
    if (alreadyFriends) {
      return res.status(400).json({ error: 'Already friends!' });
    }

    userData.friends.push({
      username: friendUser.username,
      friendCode: friendUser.friendCode,
      addedAt: new Date()
    });
    await userData.save();

    res.json({ success: true, friend: userData.friends[userData.friends.length - 1] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/friends/:friendCode', requireAuth, async (req, res) => {
  try {
    const userData = await UserData.findOne({ userId: req.session.userId });
    userData.friends = userData.friends.filter(f => f.friendCode !== req.params.friendCode);
    await userData.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Gift card route
app.post('/api/gift-card', requireAuth, async (req, res) => {
  try {
    const { toUsername, name, goal, slots } = req.body;
    const currentUser = await User.findById(req.session.userId);
    
    const recipient = await User.findOne({ username: toUsername.toLowerCase() });
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient not found' });
    }

    const recipientData = await UserData.findOne({ userId: recipient._id });
    if (!recipientData) {
      return res.status(400).json({ error: 'Recipient data not found' });
    }

    recipientData.stickerCards.push({
      name,
      goal,
      slots,
      givenBy: currentUser.username,
      stickers: [],
      status: 'in-progress'
    });
    await recipientData.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
