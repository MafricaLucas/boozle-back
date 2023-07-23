const express = require('express');
const pool = require('../database'); // Replace with your database connection
const authenticate = require('../authenticate'); // Replace with your authentication middleware

const router = express.Router();

router.post('/add', authenticate, async (req, res) => {
    try {
        const userId = req.user.id; // Assuming you have the user ID available from the authentication middleware
        const { gameId } = req.body;

        // Check if the user has already liked the game
        const [existingLike] = await pool.query(
            'SELECT * FROM Likes WHERE UserId = ? AND GameId = ?',
            [userId, gameId]
        );

        if (existingLike) {
            return res.status(409).json({ message: 'You have already liked this game.' });
        }

        // Add the like to the database
        await pool.query('INSERT INTO Likes (UserId, GameId) VALUES (?, ?)', [userId, gameId]);

        res.json({ message: 'Like added successfully.' });
    } catch (err) {
        console.error('Error adding like:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

router.post('/remove', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { gameId } = req.body;

        // Check if the user has liked the game
        const [existingLike] = await pool.query(
            'SELECT * FROM Likes WHERE UserId = ? AND GameId = ?',
            [userId, gameId]
        );

        if (!existingLike) {
            return res.status(404).json({ message: 'You have not liked this game yet.' });
        }

        // Remove the like from the database
        await pool.query('DELETE FROM Likes WHERE UserId = ? AND GameId = ?', [userId, gameId]);

        res.json({ message: 'Like removed successfully.' });
    } catch (err) {
        console.error('Error removing like:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get the likes from the database
        const [likes] = await pool.query('SELECT * FROM Likes WHERE UserId = ?', [userId]);

        res.json({ message: 'Likes fetched successfully.', likes });
    } catch (err) {
        console.error('Error fetching likes:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});
module.exports = router;
