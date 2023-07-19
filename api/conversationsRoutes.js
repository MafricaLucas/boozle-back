const express = require('express');
const pool = require('../database');

const router = express.Router();

router.post('/', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { user1Id, user2Id } = req.body;

        await conn.query(
            'INSERT INTO Conversations (User1Id, User2Id) VALUES (?, ?)',
            [user1Id, user2Id]
        );
        res.status(201).json({ message: 'Conversation created successfully.' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error.' });
    } finally {
        if (conn) conn.end();
    }
});

router.get('/:userId', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { userId } = req.params;

        const [rows] = await conn.query(
            'SELECT * FROM Conversations WHERE User1Id = ? OR User2Id = ? ORDER BY Id DESC',
            [userId, userId]
        );
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error.' });
    } finally {
        if (conn) conn.end();
    }
});

module.exports = router;
