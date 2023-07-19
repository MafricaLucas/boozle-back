const express = require('express');
const pool = require('../database');

const router = express.Router();

router.post('/', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { conversationId, senderId, message } = req.body;

        await conn.query(
            'INSERT INTO Messages (ConversationId, SenderId, Message, TimeStamp, IsRead) VALUES (?, ?, ?, ?, ?)',
            [conversationId, senderId, message, new Date(), 0]
        );
        res.status(201).json({ message: 'Message sent successfully.' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error.' });
    } finally {
        if (conn) conn.end();
    }
});

router.get('/:conversationId', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { conversationId } = req.params;

        const [rows] = await conn.query(
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

router.put('/:messageId/read', async (req, res) => {
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
