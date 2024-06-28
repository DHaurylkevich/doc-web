const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
    id: String,
    doctor: {type: Schema.Types.ObjectId, ref: "Doctor", required: true},
    patient: {type: Schema.Types.ObjectId, ref: "Patient", required: true},
    appointmentDate: { type: Date, required: true},
    description: {type: String}
});

const Appoin