const express = require('express');
const authenticate = require('../authenticate');
const ConversationService = require('./ConversationService');

const router = express.Router();
const conversationService = new ConversationService();

router.post('/', authenticate, async (req, res) => {
    try {
        const { user2Id } = req.body;
        const response = await conversationService.createConversation(
            req.user.id,
            user2Id
        );
        res.status(201).json(response);
    } catch (err) {
        if (err.message === 'Conversation already exists.') {
            res.status(409).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'Server error.' });
        }
    }
});

router.get('/', authenticate, async (req, res) => {
    try {
        const conversations = await conversationService.getConversations(
            req.user.id
        );
        res.json(conversations);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
