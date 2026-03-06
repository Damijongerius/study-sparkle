const express = require('express');
const router = express.Router();
const planRoutes = require('./planner/planRoutes');
const taskRoutes = require('./planner/taskRoutes');

router.use('/', planRoutes);
router.use('/', taskRoutes);

module.exports = router;
