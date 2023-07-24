const pool = require('../database');

class LikeService {
    async addLike(userId, gameId) {
        try {
            const [existingLike] = await pool.query(
                'SELECT * FROM Likes WHERE UserId = ? AND GameId = ?',
                [userId, gameId]
            );

            if (existingLike) {
                throw new Error('You have already liked this game.');
            }

            await pool.query(
                'INSERT INTO Likes (UserId, GameId) VALUES (?, ?)',
                [userId, gameId]
            );

            return { message: 'Like added successfully.' };
        } catch (err) {
            console.error('Error adding like:', err);
            throw new Error('Server error.');
        }
    }

    async removeLike(userId, gameId) {
        try {
            const [existingLike] = await pool.query(
                'SELECT * FROM Likes WHERE UserId = ? AND GameId = ?',
                [userId, gameId]
            );

            if (!existingLike) {
                throw new Error('You have not liked this game yet.');
            }

            await pool.query(
                'DELETE FROM Likes WHERE UserId = ? AND GameId = ?',
                [userId, gameId]
            );

            return { message: 'Like removed successfully.' };
        } catch (err) {
            console.error('Error removing like:', err);
            throw new Error('Server error.');
        }
    }

    async fetchLikes(userId) {
        try {
            const likes = await pool.query(
                'SELECT GameId FROM Likes WHERE UserId = ?',
                [userId]
            );
            const likesArray = likes.map((like) => like.GameId);

            return {
                message: 'Likes fetched successfully.',
                likes: likesArray
            };
        } catch (err) {
            console.error('Error fetching likes:', err);
            throw new Error('Server error.');
        }
    }
}

module.exports = LikeService;
