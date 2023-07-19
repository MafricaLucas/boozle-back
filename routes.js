const express = require('express');
const healthcheckRoutes = require('./api/healthcheckRoutes');

const router = express.Router();

router.use('/healthcheck', healthcheckRoutes);
router.use('/banger', healthcheckRoutes);

module.exports = router;
