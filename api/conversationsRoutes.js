const express = require('express');
const pool = require('../database');
const authenticate = require('../authenticate');
require('dotenv').config();

const router = express.Router();

router.post('/', authenticate, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { user2Id } = req.body;

        const existingConvo = await conn.query(
            'SELECT * FROM Conversations WHERE (User1Id = ? AND User2Id = ?) OR (User1Id = ? AND User2Id = ?)',
            [req.user.id, user2Id, user2Id, req.user.id]
        );

        if (existingConvo && existingConvo.length > 0) {
            return res
                .status(409)
                .json({ message: 'Conversation already exists.' });
        }

        await conn.query(
            'INSERT INTO Conversations (User1Id, User2Id) VALUES (?, ?)',
            [req.user.id, user2Id]
        );

        res.status(201).json({ message: 'Conversation created successfully.' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    } finally {
        if (conn) conn.end();
    }
});

router.get('/', authenticate, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();

        const conversations = await conn.query(
            'SELECT * FROM Conversations WHERE User1Id = ? OR User2Id = ?',
            [req.user.id, req.user.id]
        );
        res.json(conversations);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error.' });
    } finally {
        if (conn) conn.end();
    }
});

module.exports = router;
