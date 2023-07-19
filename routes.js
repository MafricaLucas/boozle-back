const express = require('express');
const healthcheckRoutes = require('./api/healthcheckRoutes');
const userRoutes = require('./api/userRoutes');

const router = express.Router();

router.use('/healthcheck', healthcheckRoutes);
router.use('/users', userRoutes);

module.exports = router;
