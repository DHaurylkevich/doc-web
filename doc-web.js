const express = require("express");
const morgan = require("morgan");
const errorHandler = require("./src/middleware/errorHandler");
const app = express();
require("./src/config/db");
require("dotenv").config();

app.use(express.json());
app.use(morgan("dev"));
app.use("/api", require("./src/routes"));

app.get("/", (req, res) => {
    res.send("Hello");
})

app.use((req, res, next) => {
    res.status(404).json({ message: "Not Found" });
});

app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(
    `http://localhost:${port}`));

module.exports = app;

