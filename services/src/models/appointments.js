const mongoose = require("mongoose");

const appointmentSchema = mongoose.Schema({
    doctor: {
        type: Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
        index: true 
    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "Patient", 
        required: true, 
        index: true 
    },
    date: { 
        type: Date,
        required: true},
    description: {
        type: String
    }
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;