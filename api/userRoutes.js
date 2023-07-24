const express = require('express');
const { validateUser, validateLogin } = require('../validators');
const { validationResult } = require('express-validator');
const UserService = require('../services/UserService');
const PasswordResetService = require('../services/PasswordResetService');

require('dotenv').config();

const router = express.Router();

const userService = new UserService();
const passwordResetService = new PasswordResetService();

function handleErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

router.post(
    '/register',
    validateUser,
    handleErrors,
    userService.registerUser.bind(userService)
);
router.post(
    '/login',
    validateLogin,
    handleErrors,
    userService.loginUser.bind(userService)
);
router.get('/search/:pseudo', userService.searchUser.bind(userService));
router.post(
    '/forgot-password',
    passwordResetService.requestPasswordReset.bind(passwordResetService)
);
router.post(
    '/reset-password/:token',
    passwordResetService.resetPassword.bind(passwordResetService)
);

module.exports = router;
