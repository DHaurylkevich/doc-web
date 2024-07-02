const express = require("express");
const router = express.Router();
const Appointment = require("../models/appointments");

router.post("/appointments", async (req, res) => {
    try {
        const { doctorId, patientId, date, description } = req.body;

        if (!doctorId || !patientId || !date) {
            return res.status(400).json({message: "Не хватает обязательных полей: doctorId, patientId, date" });
        }

        const appointment = new Appointment({
            doctor: doctorId,
            patient: patientId,
            date,
            description
        });

        const savedAppointment = await appointment.save();
        res.status(201).send(savedAppointment);
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.get("/appointments", async (req, res) => {
    try {
        const appointments = await Appointment.find().lean().exec();
        res.status(200).json(appointments);
    } catch(err){
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.get("/appointments/:id", async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id).lean().exec();
        if (!appointment) {
            return res.status(404).json({ message: 'Запись не найдена' });
        }
        res.status(200).json(appointment);
    } catch(err){
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.put("/appointments/:id", async (req, res) => {
    try {
        const { doctorId, patientId, date, description } = req.body;

        if (!doctorId || !patientId || !date) {
            return res.status(400).json({message: "Не хватает обязательных полей: doctorId, patientId, date" });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { doctor: doctorId, patient: patientId, date, description },
            { new: true, runValidators: true }
        ).lean().exec();

        if (!updatedAppointment) {
            return res.status(404).json({ message: 'Запись не найдена' });
        }
        res.status(200).json(updatedAppointment);
    } catch(err){
        console.error(err);
        res.status(500).json({message: err.message});
    }
});

router.delete("/appointments/:id", async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id).lean().exec();;
        if (!appointment) {
            return res.status(404).json({ message: 'Запись не найдена' });
        }

        await Appointment.findByIdAndDelete(req.params.id).lean().exec();;

        res.status(201).json({ message: "Запись удалена" });
    } catch(err){
        console.error(err)
        res.status(500).json({ message: err.message});
    }
});

module.exports = router;