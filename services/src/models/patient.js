const mongoose = require("mongoose");

const patientSchema = mongoose.Schema({
    name: {type: String, required: true},
    age: {type: Number, required: true},
    contact: {type: String, required: true},
    medicalHistory: {type: String}
});

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;