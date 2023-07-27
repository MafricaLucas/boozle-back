const pool = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserService {
    async registerUser(req, res) {
        let conn;
        try {
            conn = await pool.getConnection();

            const [existingUser] = await conn.query(
                'SELECT * FROM Users WHERE email = ?',
                [req.body.email]
            );

            if (existingUser) {
                return res
                    .status(409)
                    .json({ message: 'Email already in use.' });
            }

            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            await conn.query(
                'INSERT INTO Users (email, password, pseudo) VALUES (?, ?, ?)',
                [req.body.email, hashedPassword, req.body.pseudo]
            );

            res.status(201).json({
                status: 201,
                message: 'User registered successfully.'
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Server error.' });
        } finally {
            if (conn) conn.end();
        }
    }

    async loginUser(req, res) {
        let conn;
        try {
            conn = await pool.getConnection();
            const user = await conn.query(
                'SELECT * FROM Users WHERE email = ?',
                [req.body.email]
            );

            if (!user || user.length === 0) {
                return res
                    .status(401)
                    .json({ message: 'Invalid email or password.' });
            }

            const LoggedUser = user[0];
            const passwordMatch = await bcrypt.compare(
                req.body.password,
                LoggedUser.Password
            );

            if (!passwordMatch) {
                return res
                    .status(401)
                    .json({ message: 'Invalid email or password.' });
            }

            const token = jwt.sign(
                { id: LoggedUser.Id },
                process.env.PRIVATE_KEY_AUTH,
                {}
            );

            res.json({
                status: 201,
                token,
                id: LoggedUser.Id,
                email: LoggedUser.Email,
                pseudo: LoggedUser.Pseudo
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Server error.' });
        } finally {
            if (conn) conn.end();
        }
    }

    async searchUser(req, res) {
        let conn;
        try {
            conn = await pool.getConnection();
            const { pseudo } = req.params;

            const rows = await conn.query(
                'SELECT id, email, pseudo, ProfileImageUrl FROM Users WHERE pseudo LIKE ?',
                [`%${pseudo}%`]
            );
            res.json(rows);
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Server error.' });
        } finally {
            if (conn) conn.end();
        }
    }
}

module.exports = UserService;
