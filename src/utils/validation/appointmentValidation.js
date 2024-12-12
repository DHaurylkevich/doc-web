const { body, query, param } = require('express-validator');

const paramExist = (paramName) => {
    return [
        param(paramName)
            .exists().withMessage(`${paramName} is required`)
    ]
};

const filterDateExist = [
    param("doctorId")
        .exists().withMessage("Doctor is required"),
    query("startDate")
        .exists().withMessage("Start date is required")
];

const createDataExist = [
    body("doctorId")
        .exists().withMessage("Doctor is required"),
    body("doctorServiceId")
        .exists().withMessage("Doctor service is required"),
    body("clinicId")
        .exists().withMessage("Clinic is required"),
    body("date")
        .exists().withMessage("Date is required"),
    body("timeSlot")
        .exists().withMessage("Time slot is required"),
    body("firstVisit")
        .exists().withMessage("First visit value is required"),
    body("visitType")
        .exists().withMessage("Visit type value is required")
];

module.exports = {
    paramExist,
    filterDateExist,
    createDataExist
};