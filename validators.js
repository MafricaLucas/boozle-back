const { body } = require('express-validator');

exports.validateUser = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email.')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long.')
];
