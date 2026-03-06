const express = require('express');
const bcrypt = require('bcryptjs');
const { User, UserData } = require('../../models');
const { generateUniqueFriendCode } = require('../../utils/friendCode');
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password || username.length < 2 || !/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: 'Invalid input' });
    if (await User.findOne({ username: username.toLowerCase() })) return res.status(400).json({ error: 'Exists' });
    const user = await User.create({ username: username.toLowerCase(), passwordHash: await bcrypt.hash(password, 10), friendCode: await generateUniqueFriendCode() });
    await UserData.create({ userId: user._id, stickerCards: [{ name: 'Starter Card', slots: 9, stickers: [], status: 'in-progress' }] });
    req.session.userId = user._id; req.session.username = user.username; user.activeSessionId = req.session.id; await user.save();
    res.json({ success: true, user: { username: user.username, friendCode: user.friendCode }, friends: [] });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username?.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(400).json({ error: 'Invalid' });
    if (user.activeSessionId && req.redisClient) await req.redisClient.del(`sess:${user.activeSessionId}`).catch(() => {});
    req.session.userId = user._id; req.session.username = user.username; user.activeSessionId = req.session.id; await user.save();
    const data = await UserData.findOne({ userId: user._id });
    res.json({ success: true, user: { username: user.username, friendCode: user.friendCode }, friends: data?.friends || [] });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.post('/logout', async (req, res) => {
  if (req.session.userId) await User.findByIdAndUpdate(req.session.userId, { activeSessionId: null }).catch(() => {});
  req.session.destroy(err => { res.clearCookie('connect.sid'); res.json({ success: true }); });
});

router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  const user = await User.findById(req.session.userId);
  if (!user || user.activeSessionId !== req.session.id) { req.session.destroy(() => {}); return res.json({ user: null, error: 'Expired' }); }
  const data = await UserData.findOne({ userId: user._id });
  res.json({ user: { username: user.username, friendCode: user.friendCode }, friends: data?.friends || [] });
});

router.get('/check', async (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  const user = await User.findById(req.session.userId);
  if (!user || user.activeSessionId !== req.session.id) { return res.json({ user: null }); }
  const data = await UserData.findOne({ userId: user._id });
  res.json({ user: { username: user.username, friendCode: user.friendCode }, friends: data?.friends || [] });
});

module.exports = router;
