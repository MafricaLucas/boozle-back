const express = require('express');
const authenticate = require('../authenticate');
const MessageService = require('../services/MessageService');
require('dotenv').config();

const router = express.Router();
const messageService = new MessageService();

router.post('/', authenticate, async (req, res) => {
    try {
        const response = await messageService.sendMessage(
            req.user.id,
            req.body.conversationId,
            req.body.message
        );
        res.status(201).json(response);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/unread', authenticate, async (req, res) => {
    try {
        const unreadMessages = await messageService.getUnreadMessages(
            req.user.id
        );
        res.json(unreadMessages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:conversationId', authenticate, async (req, res) => {
    try {
        const messages = await messageService.getMessagesFromConversation(
            req.params.conversationId
        );
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:messageId/read', authenticate, async (req, res) => {
    try {
        const response = await messageService.markMessageAsRead(
            req.params.messageId
        );
        res.json(response);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
