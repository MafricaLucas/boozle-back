const express = require('express');
const pool = require('../database');
const bcrypt = require('bcrypt');
const { validateUser, validateLogin } = require('../validators');
const { validationResult } = require('express-validator');
require('dotenv').config();

const router = express.Router();

router.post('/register', validateUser, async (req, res) => {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let conn;
    try {
        conn = await pool.getConnection();

        // Check if email already exists
        const [existingUser] = await conn.query(
            'SELECT * FROM Users WHERE email = ?',
            [req.body.email]
        );
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create new user
        await conn.query(
            'INSERT INTO Users (email, password, pseudo) VALUES (?, ?, ?)',
            [req.body.email, hashedPassword, req.body.pseudo]
        );

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error.' });
    } finally {
        if (conn) conn.end();
    }
});

router.post('/login', validateLogin, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let conn;
    try {
        conn = await pool.getConnection();

        // Find user with the given email
        const [user] = await conn.query('SELECT * FROM Users WHERE email = ?', [
            req.body.email
        ]);
        if (!user) {
            return res
                .status(401)
                .json({ message: 'Invalid email or password.' });
        }

        // Check if the provided password matches the one in the database
        console.log(req.body.password);
        console.log(user.password);
        console.log(bcrypt.compare(req.body.password, user.password));
        const passwordMatch = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!passwordMatch) {
            return res
                .status(401)
                .json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.PRIVATE_KEY_AUTH,
            {}
        );

        res.json({
            token,
            id: user.id,
            email: user.email,
            pseudo: user.pseudo
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error.' });
    } finally {
        if (conn) conn.end();
    }
});

router.get('/search/:pseudo', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { pseudo } = req.params;

        const rows = await conn.query(
            'SELECT id, email, pseudo FROM Users WHERE pseudo LIKE ?',
            [`%${pseudo}%`]
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
