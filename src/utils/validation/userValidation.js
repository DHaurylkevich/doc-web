const { body } = require('express-validator');

const passwordValidation = [
    body("newPassword")
        .exists().withMessage("New Password is required")
        .isLength({ min: 9 }).withMessage("Password must be at least 8 characters")
        .trim()
];
module.exports = {
    passwordValidation,
};