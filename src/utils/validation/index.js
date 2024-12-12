const { body, param } = require('express-validator');


const validateParam = (paramName, options = {}) => {
    const { matchUser = false } = options;
    return [
        param(paramName)
            .exists().withMessage(`${paramName} is required`)
            .bail()
            .custom((value, { req }) => {
                if (matchUser) {
                    if (!req.user || req.user.id !== value) {
                        throw new Error(`${paramName} must match the authenticated user's ID`);
                    }
                }
                return true;
            }),
    ];
};

const serviceCreateValidation = [
    body("name")
        .exists().withMessage("Name is required")
        .trim(),
    body("specialtyId")
        .exists().withMessage("SpecialtyId is required"),
    body("price")
        .exists().withMessage("Price is required")
        .trim()
];

module.exports = {
    validateParam,
    serviceCreateValidation,
};