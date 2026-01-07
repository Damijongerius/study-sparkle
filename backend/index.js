const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/studybuddy')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const activitySchema = new mongoose.Schema({
  type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: mongoose.Schema.Types.Mixed,
});

const stickerCardSchema = new mongoose.Schema({
  name: String,
  slots: Number,
  stickers: [{ stickerId: String, earnedAt: Date }],
  status: { type: String, enum: ['in-progress', 'done', 'redeemed'], default: 'in-progress' },
  completedAt: Date,
  redeemedAt: Date,
});

const userDataSchema = new mongoose.Schema({
  totalPoints: { type: Number, default: 0 },
  totalStudyMinutes: { type: Number, default: 0 },
  studySessions: { type: Number, default: 0 },
  ownedStickers: [{ stickerId: String, earnedAt: Date }],
  stickerCards: [stickerCardSchema],
  dailyCooldowns: { type: Map, of: String },
  activityLogs: [activitySchema],
}, { timestamps: true });

const UserData = mongoose.model('UserData', userDataSchema);

// Routes
app.get('/api/data', async (req, res) => {
  try {
    let data = await UserData.findOne();
    if (!data) {
      data = await UserData.create({ stickerCards: [{ name: 'Starter Card', slots: 9, stickers: [], status: 'in-progress' }] });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/data', async (req, res) => {
  try {
    let data = await UserData.findOne();
    if (!data) {
      data = new UserData(req.body);
    } else {
      Object.assign(data, req.body);
    }
    await data.save();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/activity', async (req, res) => {
  try {
    let data = await UserData.findOne();
    if (!data) {
      data = await UserData.create({ stickerCards: [{ name: 'Starter Card', slots: 9, stickers: [], status: 'in-progress' }] });
    }
    data.activityLogs.unshift(req.body);
    if (data.activityLogs.length > 500) data.activityLogs = data.activityLogs.slice(0, 500);
    await data.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
