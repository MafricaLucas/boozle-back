const pool = require('../database');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

class PasswordResetService {
    async requestPasswordReset(req, res) {
        const { email } = req.body;

        try {
            const [user] = await pool.query(
                'SELECT * FROM Users WHERE email = ?',
                [email]
            );

            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }
            const token = await this.generateToken();

            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1);

            await pool.query(
                'INSERT INTO PasswordResetToken (UserId, Token, ExpiresAt) VALUES (?, ?, ?)',
                [user.Id, token, expiresAt]
            );

            this.sendResetPasswordEmail(email, token);

            res.json({ message: 'Password reset link sent successfully.' });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Server error.' });
        }
    }

    async resetPassword(req, res) {
        const { token } = req.params;
        const { password } = req.body;

        try {
            const [tokenRecord] = await pool.query(
                'SELECT * FROM PasswordResetToken WHERE Token = ?',
                [token]
            );

            if (!tokenRecord) {
                return res
                    .status(404)
                    .json({ message: 'Invalid or expired token.' });
            }

            if (tokenRecord.ExpiresAt < new Date()) {
                return res.status(401).json({ message: 'Token has expired.' });
            }

            const [user] = await pool.query(
                'SELECT * FROM Users WHERE Id = ?',
                [tokenRecord.UserId]
            );

            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query('UPDATE Users SET Password = ? WHERE Id = ?', [
                hashedPassword,
                user.Id
            ]);
            await pool.query(
                'DELETE FROM PasswordResetToken WHERE UserId = ?',
                [user.Id]
            );

            res.json({
                status: 201,
                message: 'Password reset successfully.'
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Server error.' });
        }
    }

    async sendResetPasswordEmail(email, token) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.USER_GMAIL,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.CLIENT_REFRESH_TOKEN
            }
        });
        const mailOptions = {
            from: process.env.USER_GMAIL,
            to: email,
            subject: 'Password Reset', // Subject line
            html: `
                      <p>Bonjour,</p>
                      <p>Veuillez cliquer sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
                      <a href="http://51.255.50.74:86/reset-password/${token}">Réinitialiser le mot de passe</a>
                      <p>Ce lien expirera dans 1 heure.</p>
                      <p>Cordialement,</p>
                      <p>Votre équipe de support</p>
                  `
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err) console.log(err);
            else console.log(info);
        });
    }

    generateToken() {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(20, (err, buffer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(buffer.toString('hex'));
                }
            });
        });
    }
}

module.exports = PasswordResetService;
