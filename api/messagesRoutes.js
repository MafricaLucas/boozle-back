const express = require('express');
const pool = require('../database');
const authenticate = require('../authenticate');
require('dotenv').config();

const router = express.Router();

router.post('/', authenticate, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { conversationId, message } = req.body;

        await conn.query(
            'INSERT INTO Messages (ConversationId, SenderId, Message, TimeStamp, IsRead) VALUES (?, ?, ?, ?, ?)',
            [conversationId, req.user.id, message, new Date(), 0]
        );

        // Mark all other unread messages in the conversation as read
        await conn.query(
            'UPDATE Messages SET IsRead = 1 WHERE ConversationId = ? AND SenderId != ? AND IsRead = 0',
            [conversationId, req.user.id]
        );

        res.status(201).json({ message: 'Message sent successfully.' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error.' });
    } finally {
        if (conn) conn.end();
    }
});

router.get('/:conversationId', authenticate, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { conversationId } = req.params;

        const rows = await conn.query(
            'SELECT * FROM Messages WHERE ConversationId = ? ORDER BY TimeStamp DESC',
            [conversationId]
        );
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error.' });
    } finally {
        if (conn) conn.end();
    }
});

router.put('/:messageId/read', authenticate, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { messageId } = req.params;

        await conn.query('UPDATE Messages SET IsRead = ? WHERE Id = ?', [
            1,
            messageId
        ]);
        res.json({ message: 'Message marked as read.' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error.' });
    } finally {
        if (conn) conn.end();
    }
});

module.exports = router;
