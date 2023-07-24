const pool = require('../database');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

class ProfileService {
    async uploadImage(userId, file) {
        try {
            let conn;
            conn = await pool.getConnection();

            if (!file) {
                throw new Error('No file provided.');
            }

            const newFilename = `/app/images/${file.filename}`;
            await sharp(file.path)
                .resize(720, 720, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .toFile(newFilename);

            fs.unlink(path.join('/app/images', file.path), (err) => {
                if (err) console.log(err);
            });

            const [user] = await conn.query(
                'SELECT ProfileImageUrl FROM Users WHERE Id = ?',
                [userId]
            );
            const oldImageUrl = user ? user.ProfileImageUrl : null;

            await conn.query(
                'UPDATE Users SET ProfileImageUrl = ? WHERE Id = ?',
                [newFilename, userId]
            );

            if (oldImageUrl) {
                fs.unlink(oldImageUrl, (err) => {
                    if (err) console.log('Error deleting file:', err);
                });
            }

            conn.end();

            return { message: 'Image uploaded successfully.' };
        } catch (err) {
            console.log(err);
            throw new Error(
                'An error occurred while processing your request. Please try again later.'
            );
        }
    }
}

module.exports = ProfileService;
