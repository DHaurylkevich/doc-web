const express = require("express");
const router = express.Router();
const Patient = require("../models/patient");

router.post("/patients", async (req, res) => {
    try {
        const { name, age, contact, medicalHistory  } = req.body;
        if (!name || !age || !contact) {
            return res.status(400).json({ message: "Не хватает обязательных полей: name, specialization, contact" });
        }
        const patient = new Patient({ 
            name, 
            age, 
            contact,
            medicalHistory
        });
        const savePatient = await patient.save();
        res.status(201).send(savePatient);
    } catch (err){
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.get("/patients", async (req, res) => {
    try {
        const patients = await Patient.find().lean().exec();
        if (!patients) {
            return res.status(200).json({ message: "Пациенты не ныйдены" });
        }
        res.status(200).json(patients);
    } catch (err){
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.get("/patients/:id", async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id).lean().exec();
        if (!patient) {
            return res.status(200).json({ message: "Пациенты не найдены" });
        }
        res.status(200).json(patient);
    } catch (err){
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.put("/patients/:id", async (req, res) => {
    try {
        const { name, specialization, contact } = req.body;
        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            { name, age, contact, medicalHistory },
            { new: true, runValidation: true }
        );
        if (!patient) {
            return res.status(404).json({ message: "Пациент не найден" });
        }
        res.status(200).json(patient);
    } catch (err){
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.delete("/patients/:id", async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: "Пациент не найден" });
        }
        res.status(200).json({ message: "Пациент удален" });
    } catch (err){
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;