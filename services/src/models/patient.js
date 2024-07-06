const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const patientSchema = mongoose.Schema({
    name: {type: String, required: true},
    age: {type: Number, required: true},
    contact: {type: String, required: true},
    medicalHistory: {type: String},
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true}
});

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;