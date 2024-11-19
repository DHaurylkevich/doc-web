require('dotenv').config();
const express = require("express");
const http = require('http');
const app = express();
const server = http.createServer(app);
const passport = require('passport');
const sessionConfig = require('./src/config/session');
const { errorHandler } = require("./src/middleware/errorHandler");
const AppError = require("./src/utils/appError");
const swaggerDocs = require("./src/utils/swagger");
const morgan = require("morgan");
const cors = require("cors");

const io = require("./src/controllers/websocketController");

require("./src/config/db");

app.use(sessionConfig);
app.use(passport.initialize());
app.use(passport.session());
io(server, sessionConfig, passport);
require('./src/config/passport');

app.use(express.json());
app.use(morgan("dev"));
swaggerDocs(app);
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));


app.get("/", (req, res) => { res.send("Hello"); })
app.use("/", require("./src/routes"));

app.use((req, res, next) => { next(new AppError("Not Found", 404)); });
app.use(errorHandler);

const port = process.env.PORT || 5000;
const link = process.env.LINK || "http://localhost";


server.listen(port, () => {
    console.log(`The server start at: ${link}:${port}`)
    console.log(`The documentation is available at: ${link}:${port}/api-docs`);
});

// module.exports = server;