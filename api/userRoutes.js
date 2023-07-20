const express = require('express');
const pool = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateUser, validateLogin } = require('../validators');
const { validationResult } = require('express-validator');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const upload = multer({
    dest: '/images',
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(null, false, new Error('Not an image'));
        }
        cb(null, true);
    }
});

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
        const user = await conn.query('SELECT * FROM Users WHERE email = ?', [
            req.body.email
        ]);

        if (!user || user.length === 0) {
            return res
                .status(401)
                .json({ message: 'Invalid email or password.' });
        }

        const LoggedUser = user[0];

        // Check if the provided password matches the one in the database
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

router.post(
    '/profileImage',
    authenticate,
    upload.single('image'),
    async (req, res) => {
        let conn;
        try {
            conn = await pool.getConnection();
            const { file } = req;

            if (!file) {
                return res.status(400).json({ message: 'No file provided.' });
            }

            // resize image and move to correct directory
            const newFilename = `/images/${file.filename}`;
            await sharp(file.path)
                .resize(720, 720, {
                    fit: 'inside', // maintain aspect ratio
                    withoutEnlargement: true // avoid enlarging smaller images
                })
                .toFile(path.join(__dirname, '../', newFilename)); // path where resized image is saved

            // Delete original uploaded image from tmp directory
            fs.unlink(file.path, (err) => {
                if (err) console.log(err);
            });

            // Get the old image url.
            const [user] = await conn.query(
                'SELECT ProfileImageUrl FROM Users WHERE Id = ?',
                [req.user.id]
            );
            const oldImageUrl = user ? user.ProfileImageUrl : null;

            // Update the user's profile image URL in the database.
            await conn.query(
                'UPDATE Users SET ProfileImageUrl = ? WHERE Id = ?',
                [newFilename, req.user.id]
            );

            // If an old image exists, delete it.
            if (oldImageUrl) {
                const oldImagePath = path.join(__dirname, '../', oldImageUrl);
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.log(err);
                });
            }

            res.json({ message: 'Image uploaded successfully.' });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                message:
                    'An error occurred while processing your request. Please try again later.'
            });
        } finally {
            if (conn) conn.end();
        }
    }
);

module.exports = router;
