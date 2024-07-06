const express = require("express");
const connectDB = require("./src/config/connectDB");
const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(express.json());

app.use("/api/appointments", require("./src/routes/appointments"));
app.use("/api/users", require("./src/routes/users"));
app.use("/api/patients", require("./src/routes/patient"));
app.use("/api/doctors", require("./src/routes/doctors"));


app.get("/", (req, res) => {
    res.send("Hello");
})

app.use((req, res, next) => {
    res.status(404).json({ message: "Not Found" });
});   

app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({ message: "Server Error"});
});

app.listen(port, ( ) => console.log(
    `Express запущен на http://localhost: ${ port }) ; ` +
    `нажмите Ctrl+C для завершения.`))