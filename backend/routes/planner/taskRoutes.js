const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const { withUserData } = require('../../middleware/userData');

router.use(requireAuth);
router.use(withUserData);

router.post('/:planId/task', async (req, res) => {
  const plan = req.userData.plans.find(p => p.id === req.params.planId);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  const task = { ...req.body, status: 'pending' };
  plan.tasks.push(task); await req.userData.save();
  res.status(201).json({ task });
});

router.patch('/:planId/task/:taskId', async (req, res) => {
  const plan = req.userData.plans.find(p => p.id === req.params.planId);
  const task = plan?.tasks.find(t => t.id === req.params.taskId);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  Object.assign(task, req.body);
  if (plan.tasks.every(t => t.status === 'completed')) plan.status = 'completed';
  else if (plan.tasks.some(t => t.status === 'completed' || t.status === 'in-progress')) plan.status = 'in-progress';
  await req.userData.save(); res.json({ task });
});

router.delete('/:planId/task/:taskId', async (req, res) => {
  const plan = req.userData.plans.find(p => p.id === req.params.planId);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  plan.tasks = plan.tasks.filter(t => t.id !== req.params.taskId);
  plan.tasks.forEach(t => t.dependencies = t.dependencies.filter(d => d !== req.params.taskId));
  await req.userData.save(); res.json({ success: true });
});

module.exports = router;
