const express = require('express');
const pool = require('../database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { validateUser, validateLogin } = require('../validators');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

require('dotenv').config();

const router = express.Router();

router.post('/register', validateUser, async (req, res) => {
    // Check validation results
    console.log(req.body);
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
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
  
    try {
      const [user] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      const token = await generateToken();
  
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
  
      await pool.query('INSERT INTO PasswordResetToken (UserId, Token, ExpiresAt) VALUES (?, ?, ?)', [user.Id, token, expiresAt]);
  
      sendResetPasswordEmail(email, token);
  
      res.json({ message: 'Password reset link sent successfully.' });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Server error.' });
    }
  });

  // Exemple de code pour la réinitialisation du mot de passe
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
  
    try {
      // Find the token in the PasswordResetTokens table
      const [tokenRecord] = await pool.query('SELECT * FROM PasswordResetToken WHERE Token = ?', [token]);
  
      if (!tokenRecord) {
        return res.status(404).json({ message: 'Invalid or expired token.' });
      }
  
      if (tokenRecord.ExpiresAt < new Date()) {
        // Token has expired
        return res.status(401).json({ message: 'Token has expired.' });
      }
  
      // Find the user associated with the token
      const [user] = await pool.query('SELECT * FROM Users WHERE Id = ?', [tokenRecord.UserId]);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Update the user's password in the Users table
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('UPDATE Users SET Password = ? WHERE Id = ?', [hashedPassword, user.Id]);
  
      // Delete the token from the PasswordResetTokens table
      await pool.query('DELETE FROM PasswordResetToken WHERE Token = ?', [token]);
  
      res.json({ message: 'Password reset successfully.' });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Server error.' });
    }
  });
  
  async function sendResetPasswordEmail(email, token) {

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          type: 'OAuth2',
          user: process.env.USER_GMAIL,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.CLIENT_REFRESH_TOKEN,
      },
  });
  const mailOptions = {
    from: 'boozleappcontact@gmail.com',
    to: email, 
    subject: 'Password Reset', // Subject line
    html: `
                <p>Bonjour,</p>
                <p>Veuillez cliquer sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
                <a href="http://votre_site_web/reset-password/${token}">Réinitialiser le mot de passe</a>
                <p>Ce lien expirera dans 1 heure.</p>
                <p>Cordialement,</p>
                <p>Votre équipe de support</p>
            `,
};

transporter.sendMail(mailOptions, function (err, info) {
    if(err)
      console.log(err)
    else
      console.log(info);
});

  }
    function generateToken() {
        return new Promise((resolve, reject) => {
          crypto.randomBytes(48, function (err, buffer) {
            if (err) {
              reject(err);
            } else {
              const token = buffer.toString('hex');
              resolve(token);
            }
          });
        });
      }

module.exports = router;
