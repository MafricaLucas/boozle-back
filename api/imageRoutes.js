const express = require('express');
const pool = require('../database');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const authenticate = require('../authenticate');

function multerErrorHandling(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        res.status(500).send({ message: `Multer error: ${err.message}` });
    } else if (err) {
        res.status(500).send({ message: `General error: ${err.message}` });
    }
    next(err);
}

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

const router = express.Router();

router.post(
    '/profileImage',
    authenticate,
    upload.single('image'),
    multerErrorHandling,
    async (req, res) => {
        let conn;
        try {
            conn = await pool.getConnection();
            const { file } = req;

            if (!file) {
                return res.status(400).json({ message: 'No file provided.' });
            }

            // resize image and move to correct directory
            const newFilename = `/images/${file.filename}`; // Chemin relatif sans le préfixe '/app/images/'
            await sharp(file.path)
                .resize(720, 720, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .toFile(`.${newFilename}`);

            // Delete original uploaded image from tmp directory
            fs.unlink(path.join('/app/images', file.path), (err) => {
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
                fs.unlink(oldImageUrl, (err) => {
                    if (err) console.log('Error deleting file:', err);
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
