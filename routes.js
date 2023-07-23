const express = require('express');
const healthcheckRoutes = require('./api/healthcheckRoutes');
const userRoutes = require('./api/userRoutes');
const imagesRoutes = require('./api/imageRoutes');
const messagesRoutes = require('./api/messagesRoutes');
const conversationsRoutes = require('./api/conversationsRoutes');
const likesRoutes = require('./api/likesRoutes');

const router = express.Router();

router.use('/healthcheck', healthcheckRoutes);
router.use('/users', userRoutes);
router.use('/images', imagesRoutes);
router.use('/messages', messagesRoutes);
router.use('/conversations', conversationsRoutes);
router.use('/likes', likesRoutes);

module.exports = router;
