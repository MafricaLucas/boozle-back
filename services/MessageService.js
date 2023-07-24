const pool = require('../database');

class MessageService {
    async sendMessage(userId, conversationId, message) {
        let conn;
        try {
            conn = await pool.getConnection();

            await conn.query(
                'INSERT INTO Messages (ConversationId, SenderId, Message, TimeStamp, IsRead) VALUES (?, ?, ?, ?, ?)',
                [conversationId, userId, message, new Date(), 0]
            );

            await conn.query(
                'UPDATE Messages SET IsRead = 1 WHERE ConversationId = ? AND SenderId != ? AND IsRead = 0',
                [conversationId, userId]
            );

            return { message: 'Message sent successfully.' };
        } catch (err) {
            console.log(err);
            throw new Error('Server error.');
        } finally {
            if (conn) conn.end();
        }
    }

    async getUnreadMessages(userId) {
        let conn;
        try {
            conn = await pool.getConnection();

            const unreadMessages = await conn.query(
                'SELECT Messages.* FROM Messages ' +
                    'JOIN Conversations ON Messages.ConversationId = Conversations.Id ' +
                    'WHERE (Conversations.User1Id = ? OR Conversations.User2Id = ?) ' +
                    'AND Messages.SenderId != ? AND Messages.IsRead = 0 ' +
                    'ORDER BY Messages.TimeStamp DESC',
                [userId, userId, userId]
            );

            return unreadMessages;
        } catch (err) {
            console.log(err);
            throw new Error('Server error.');
        } finally {
            if (conn) conn.end();
        }
    }

    async getMessagesFromConversation(conversationId) {
        let conn;
        try {
            conn = await pool.getConnection();

            const rows = await conn.query(
                'SELECT * FROM Messages WHERE ConversationId = ? ORDER BY TimeStamp DESC',
                [conversationId]
            );

            return rows;
        } catch (err) {
            console.log(err);
            throw new Error('Server error.');
        } finally {
            if (conn) conn.end();
        }
    }

    async markMessageAsRead(messageId) {
        let conn;
        try {
            conn = await pool.getConnection();

            await conn.query('UPDATE Messages SET IsRead = ? WHERE Id = ?', [
                1,
                messageId
            ]);

            return { message: 'Message marked as read.' };
        } catch (err) {
            console.log(err);
            throw new Error('Server error.');
        } finally {
            if (conn) conn.end();
        }
    }
}

module.exports = MessageService;
