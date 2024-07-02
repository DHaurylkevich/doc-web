const mongoose = require("mongoose");
const config = require("./index");
const db = config.databaseURI;

const connectDB = async () => {
    try{
        await mongoose.connect(db);
        console.log("MongoDB connected...");
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;