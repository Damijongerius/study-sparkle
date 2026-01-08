const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
  friendCode: { type: String, required: true, unique: true, index: true },
  activeSessionId: { type: String, default: null },
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

// Helper: generate unique friend code
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

// Auth middleware
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

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || username.length < 2 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be 2-20 characters' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }
    
    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const friendCode = await generateUniqueFriendCode();

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

    // Store session ID on user to enforce single session
    user.activeSessionId = req.session.id;
    await user.save();

    res.json({
      success: true,
      user: { username: user.username, friendCode: user.friendCode }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Invalidate any existing session
    if (user.activeSessionId) {
      try {
        await redisClient.del(`sess:${user.activeSessionId}`);
      } catch (e) {
        console.log('Could not invalidate old session:', e);
      }
    }

    // Set new session
    req.session.userId = user._id;
    req.session.username = user.username;

    // Store new session ID
    user.activeSessionId = req.session.id;
    await user.save();

    const userData = await UserData.findOne({ userId: user._id });

    res.json({
      success: true,
      user: { username: user.username, friendCode: user.friendCode },
      friends: userData?.friends || []
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    // Clear activeSessionId on user
    if (req.session.userId) {
      await User.findByIdAndUpdate(req.session.userId, { activeSessionId: null });
    }
  } catch (e) {
    console.error('Error clearing session:', e);
  }
  
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

    // Check if this is still the active session
    if (user.activeSessionId !== req.session.id) {
      req.session.destroy(() => {});
      return res.json({ user: null, error: 'Session expired' });
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
    
    if (!friendCode || typeof friendCode !== 'string') {
      return res.status(400).json({ error: 'Friend code is required' });
    }
    
    const normalizedCode = friendCode.toUpperCase().trim();
    
    if (normalizedCode.length !== 6) {
      return res.status(400).json({ error: 'Friend code must be 6 characters' });
    }

    const currentUser = await User.findById(req.session.userId);
    if (currentUser.friendCode === normalizedCode) {
      return res.status(400).json({ error: "You can't add yourself!" });
    }

    const friendUser = await User.findOne({ friendCode: normalizedCode });
    if (!friendUser) {
      return res.status(400).json({ error: 'Friend code not found. Please check the code and try again.' });
    }

    const userData = await UserData.findOne({ userId: req.session.userId });
    const alreadyFriends = userData.friends.some(f => f.friendCode === normalizedCode);
    if (alreadyFriends) {
      return res.status(400).json({ error: 'Already friends with this person!' });
    }

    // Add friend to current user
    userData.friends.push({
      username: friendUser.username,
      friendCode: friendUser.friendCode,
      addedAt: new Date()
    });
    await userData.save();

    // Also add current user to friend's list (mutual friendship)
    const friendData = await UserData.findOne({ userId: friendUser._id });
    if (friendData) {
      const alreadyAdded = friendData.friends.some(f => f.friendCode === currentUser.friendCode);
      if (!alreadyAdded) {
        friendData.friends.push({
          username: currentUser.username,
          friendCode: currentUser.friendCode,
          addedAt: new Date()
        });
        await friendData.save();
      }
    }

    res.json({ 
      success: true, 
      friend: {
        username: friendUser.username,
        friendCode: friendUser.friendCode
      }
    });
  } catch (err) {
    console.error('Add friend error:', err);
    res.status(500).json({ error: 'Failed to add friend' });
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

// Get friend by code (for validation)
app.get('/api/friends/lookup/:friendCode', requireAuth, async (req, res) => {
  try {
    const normalizedCode = req.params.friendCode.toUpperCase().trim();
    const friendUser = await User.findOne({ friendCode: normalizedCode });
    
    if (!friendUser) {
      return res.status(404).json({ error: 'Friend code not found' });
    }
    
    res.json({
      username: friendUser.username,
      friendCode: friendUser.friendCode
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Gift card route
app.post('/api/gift-card', requireAuth, async (req, res) => {
  try {
    const { toUsername, name, goal, slots } = req.body;
    
    // Validate inputs
    if (!toUsername || !name) {
      return res.status(400).json({ error: 'Recipient and card name are required' });
    }
    
    if (!slots || slots < 6 || slots > 25) {
      return res.status(400).json({ error: 'Slots must be between 6 and 25' });
    }
    
    if (name.length > 40) {
      return res.status(400).json({ error: 'Card name must be 40 characters or less' });
    }
    
    if (goal && goal.length > 150) {
      return res.status(400).json({ error: 'Goal must be 150 characters or less' });
    }

    const currentUser = await User.findById(req.session.userId);
    
    const recipient = await User.findOne({ username: toUsername.toLowerCase() });
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient not found' });
    }

    // Check if they are actually friends
    const currentUserData = await UserData.findOne({ userId: req.session.userId });
    const isFriend = currentUserData.friends.some(f => f.username === recipient.username);
    if (!isFriend) {
      return res.status(400).json({ error: 'You can only gift cards to friends' });
    }

    const recipientData = await UserData.findOne({ userId: recipient._id });
    if (!recipientData) {
      return res.status(400).json({ error: 'Recipient data not found' });
    }

    // Add gift card at the beginning of their cards
    recipientData.stickerCards.unshift({
      name,
      goal: goal || undefined,
      slots,
      givenBy: currentUser.username,
      stickers: [],
      status: 'in-progress'
    });
    await recipientData.save();

    // Add activity log for sender
    currentUserData.activityLogs.unshift({
      type: 'gift_sent',
      timestamp: new Date(),
      details: {
        cardName: name,
        toUsername: recipient.username
      }
    });
    await currentUserData.save();

    res.json({ success: true });
  } catch (err) {
    console.error('Gift card error:', err);
    res.status(500).json({ error: 'Failed to send gift card' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
