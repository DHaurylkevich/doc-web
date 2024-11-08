const express = require("express");
const morgan = require("morgan");
const errorHandler = require("./src/middleware/errorHandler");
const swaggerDocs = require("./src/utils/swagger");
const app = express();

require("./src/config/db");

require("dotenv").config();
// const db = require("./src/models");
// process.env.NODE_ENV = 'test';
// db.sequelize.sync({ force: true });

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.send("Hello");
})

swaggerDocs(app);

app.use("/", require("./src/routes"));

app.use((req, res, next) => {
    res.status(404).json({ message: "Not Found" });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') {
    const link = process.env.LINK || "http://localhost";
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`The server start at: ${link}:${port}`);
    });
}

module.exports = app;