const { body } = require('express-validator');

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
    serviceCreateValidation,
};