require('dotenv').config();
const express = require("express");
const morgan = require("morgan");
const AppError = require("./src/utils/appError");
const { errorHandler } = require("./src/middleware/errorHandler");
const session = require('express-session');
const passport = require('passport');
const swaggerDocs = require("./src/utils/swagger");
const app = express();

require("./src/config/db");

app.use(session(({
    secret: process.env.JWT_AUTH_TOKEN,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
})));
app.use(passport.initialize());
app.use(passport.session());
require('./src/config/passport');

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.send("Hello");
})

swaggerDocs(app);

app.use("/", require("./src/routes"));

app.use((req, res, next) => {
    next(new AppError("Not Found", 404));
});

app.use(errorHandler);

const port = process.env.PORT || 5000;
const link = process.env.LINK || "http://localhost";
app.listen(port, () => {
    console.log(`The server start at: ${link}:${port}`)
    console.log(`The documentation is available at: ${link}:${port}/api-docs`);
});

module.exports = app;