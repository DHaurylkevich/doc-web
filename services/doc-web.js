const express = require("express");
const app = express();
require("./src/config/db");
require("dotenv").config();

const port = process.env.PORT || 5000;

app.use(express.json());

app.use("/api", require("./src/routes/"));

app.get("/", (req, res) => {
    res.send("Hello");
})

app.use((req, res, next) => {
    res.status(404).json({ message: "Not Found" });
});   

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Server Error"});
});

app.listen(port, ( ) => console.log(
    `http://localhost: ${ port }`))

module.exports = app;