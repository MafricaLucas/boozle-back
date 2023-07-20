const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticate(req, res, next) {
    console.log(process.env);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Token is missing.' });
    }

    const token = authHeader.split(' ')[1];
    console.log(process.env);
    console.log(token);
    console.log(process.env.PRIVATE_KEY_AUTH);
    jwt.verify(token, process.env.PRIVATE_KEY_AUTH, (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Token is invalid.' });
        }
        console.log(user);
        req.user = user;
        next();
    });
}

module.exports = authenticate;
