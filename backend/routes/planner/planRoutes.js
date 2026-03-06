const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const { withUserData } = require('../../middleware/userData');

router.use(requireAuth);
router.use(withUserData);

router.get('/', async (req, res) => {
  res.json({ plans: req.userData.plans || [] });
});

router.post('/', async (req, res) => {
  const { title, description, id, type, examDate } = req.body;
  const plan = { id, title, description, status: 'pending', tasks: [], type: type || 'flow', examDate: examDate ? new Date(examDate) : undefined };
  req.userData.plans.push(plan); await req.userData.save();
  res.status(201).json({ plan });
});

router.patch('/:id', async (req, res) => {
  const plan = req.userData.plans.find(p => p.id === req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  Object.assign(plan, req.body); await req.userData.save();
  res.json({ plan });
});

router.delete('/:id', async (req, res) => {
  req.userData.plans = req.userData.plans.filter(p => p.id !== req.params.id);
  await req.userData.save(); res.json({ success: true });
});

module.exports = router;
