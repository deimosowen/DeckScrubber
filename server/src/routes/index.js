const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const pullsRoutes = require('./pulls');

router.use('/auth', authRoutes);
router.use('/pulls', pullsRoutes);

module.exports = router;
