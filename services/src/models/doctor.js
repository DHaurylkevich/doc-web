const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const doctorSchema = mongoose.Schema({
    name: { type: String, required: true},
    specialization: { type: String, required: true},
    contact: { type: String, required: true},
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true}
});

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;