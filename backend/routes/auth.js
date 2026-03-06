const express = require('express');
const router = express.Router();
const googleRoutes = require('./auth/googleRoutes');
const localRoutes = require('./auth/localRoutes');

router.use('/', googleRoutes);
router.use('/', localRoutes);

module.exports = router;
