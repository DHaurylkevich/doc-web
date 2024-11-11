const NODE_ENV = process.env.NODE_ENV;
const logger = require("../utils/logger");
const { validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorDetails = errors.array().map((err) => ({
            field: err.param,
            message: err.msg,
        }));
        return res.status(400).json({
            status: "Validator Error",
            errors: errorDetails,
        });
    }
    next();
};

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "Error";

    if (err.isOperational || NODE_ENV === "test" || NODE_ENV === "development") {
        logger.warn(`${err.statusCode} - ${err.message}`);

        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    }
    logger.error("ERROR:", err);
    res.status(500).json({
        status: "error",
        message: err.message || "Internal Server Error"
    });
};

module.exports = {
    errorHandler,
    validateRequest
};