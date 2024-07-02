const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Hello");
})

app.use((req, res) => 
    res.status(404).render('404')
)

app.listen(port, ( ) => console.log(
    'Express запущен на http://localhost:${port); ' +
    'нажмите Ctrl+C для завершения.'))