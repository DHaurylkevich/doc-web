require('dotenv').config();
const express = require("express");
const https = require('https');
const app = express();
const server = https.createServer(app);
const passport = require('passport');
const sessionConfig = require('./src/config/session');
const { errorHandler } = require("./src/middleware/errorHandler");
const AppError = require("./src/utils/appError");
const swaggerDocs = require("./src/utils/swagger");
const morgan = require("morgan");

const io = require("./src/controllers/websocketController");

require("./src/config/db");

app.use(sessionConfig);
io(server, sessionConfig);
app.use(passport.initialize());
app.use(passport.session());
require('./src/config/passport');


app.use(express.json());
app.use(morgan("dev"));
swaggerDocs(app);

// app.get('/', (req, res) => { res.sendFile(__dirname + '/index.html') });
app.get("/", (req, res) => { res.send("Hello"); })
app.use("/", require("./src/routes"));

app.use((req, res, next) => { next(new AppError("Not Found", 404)); });
app.use(errorHandler);

const port = process.env.PORT || 5000;
const link = process.env.LINK || "http://localhost";

// server.listen(port, () => {
//     console.log(`The server start at: ${link}:${port}`)
//     console.log(`The documentation is available at: ${link}:${port}/api-docs`);
// });

module.exports = server;