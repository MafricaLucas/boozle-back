const express = require('express');
const multer = require('multer');
const authenticate = require('../authenticate');
const ProfileService = require('./ProfileService');

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
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(null, false, new Error('Not an image'));
        }
        cb(null, true);
    }
});

const router = express.Router();
const profileService = new ProfileService();

router.post(
    '/profileImage',
    authenticate,
    upload.single('image'),
    multerErrorHandling,
    async (req, res) => {
        try {
            const response = await profileService.uploadImage(
                req.user.id,
                req.file
            );
            res.json(response);
        } catch (err) {
            if (err.message === 'No file provided.') {
                res.status(400).json({ message: err.message });
            } else {
                res.status(500).json({ message: 'Server error.' });
            }
        }
    }
);

module.exports = router;
