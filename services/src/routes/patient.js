const express = require("express");
const router = express.Router();
const Patient = require("../models/patient");

router.post("/patients", async (req, res) => {
    try {
        const { name, age, contact, medicalHistory  } = req.body;
        if (!name || !specialization || !contact) {
            return res.status(400).json({ message: "Не хватает обязательных полей: name, specialization, contact" });
        }
        const doctor = new Doctor({ 
            name, 
            specialization, 
            contact 
        });
        const saveDoctor = await doctor.save();
        res.status(201).send(saveDoctor);
    } catch (err){
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.get("/patients", async (req, res) => {
    try {
        const doctors = await Doctor.find().lean().exec();
        if (!doctors) {
            return res.status(200).json({ message: "Врачей нету" });
        }
        res.status(200).json(doctors);
    } catch (err){
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.get("/patients/:id", async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).lean().exec();
        if (!doctor) {
            return res.status(200).json({ message: "Врач не найден" });
        }
        res.status(200).json(doctor);
    } catch (err){
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.put("/patients/:id", async (req, res) => {
    try {
        const { name, specialization, contact } = req.body;
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { name, specialization, contact },
            {new: true, runValidation: true }
        );
        if (!doctor) {
            return res.status(404).json({ message: "Врач не найден" });
        }
        res.status(200).json(doctor);
    } catch (err){
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.delete("/patients/:id", async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: "Врач не найден" });
        }
        res.status(200).json({ message: "Врач удален" });
    } catch (err){
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});