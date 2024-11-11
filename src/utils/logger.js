const { createLogger, transports, format } = require("winston");

const logger = createLogger({
    level: "error",
    format: format.combine(
        format.timestamp(),
        format.json(),
    ),
    transports: [
        new transports.Console({}),
        // new transports.File({ filename: "errors.log", level: "error" }),
    ]
});

module.exports = logger;