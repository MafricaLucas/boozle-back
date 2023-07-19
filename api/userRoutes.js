const express = require('express');
const pool = require('../database');
const bcrypt = require('bcrypt');
const { validateUser, validateLogin } = require('../validators');
const { validationResult } = require('express-validator');

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
        const passwordMatch = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!passwordMatch) {
            return res
                .status(401)
                .json({ message: 'Invalid email or password.' });
        }

        // Send user data
        res.json({
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

module.exports = router;
