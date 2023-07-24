const express = require('express');
const authenticate = require('../authenticate');
const LikeService = require('./LikeService');

const router = express.Router();
const likeService = new LikeService();

router.post('/add', authenticate, async (req, res) => {
    try {
        const response = await likeService.addLike(req.user.id, req.body.gameId);
        res.json(response);
    } catch (err) {
        if (err.message === 'You have already liked this game.') {
            res.status(409).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'Server error.' });
        }
    }
});

router.post('/remove', authenticate, async (req, res) => {
    try {
        const response = await likeService.removeLike(req.user.id, req.body.gameId);
        res.json(response);
    } catch (err) {
        if (err.message === 'You have not liked this game yet.') {
            res.status(404).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'Server error.' });
        }
    }
});

router.get('/', authenticate, async (req, res) => {
    try {
        const response = await likeService.fetchLikes(req.user.id);
        res.json(response);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
