const pool = require('../database');

class ConversationService {
    async createConversation(userId, user2Id) {
        try {
            let conn;
            conn = await pool.getConnection();

            const existingConvo = await conn.query(
                'SELECT * FROM Conversations WHERE (User1Id = ? AND User2Id = ?) OR (User1Id = ? AND User2Id = ?)',
                [userId, user2Id, user2Id, userId]
            );

            if (existingConvo && existingConvo.length > 0) {
                throw new Error('Conversation already exists.');
            }

            await conn.query(
                'INSERT INTO Conversations (User1Id, User2Id) VALUES (?, ?)',
                [userId, user2Id]
            );

            conn.end();
            return { message: 'Conversation created successfully.' };
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async getConversations(userId) {
        try {
            let conn;
            conn = await pool.getConnection();

            const conversations = await conn.query(
                'SELECT * FROM Conversations WHERE User1Id = ? OR User2Id = ?',
                [userId, userId]
            );
            conn.end();
            return conversations;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
}

module.exports = ConversationService;
