const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user")
const Patient = require("../models/patient");
const Doctor = require("../models/doctor")

router.post("/register", async (req, res) => {
    const { 
        email, 
        password,
        role, 
        name, 
        contact, 
        specialization, 
        age, 
        medicalHistory 
    } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json( {message: "Пользователь с таким email существует"} );
        }
        
        user = new User({
            email,
            password: await bcrypt.hash(password, 10),
            role
        });
        
        const saveUser = await user.save();

        if (roll == "doctor") {
            const doctor = new Doctor({
                name,
                specialization,
                contact,
                userId: saveUser._id
            });
            const saveDoctor = await doctor.save();
            res.status(201).json({ saveUser, saveDoctor})
        } else if (role === "patient") {
            const patient = new Patient({
                name,
                age,
                contact,
                medicalHistory,
                userId: saveUser._id
            });
            const savePatient = await patient.save();
            res.status(201).json( saveUser, savePatient);
        } else {
            res.status(400).json({ message: "Некорректная роль" });
        }
    } catch (err){
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    try{
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json( {message: "Неверный email или пароль"} );
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Неверный email или пароль" });
        };

        const payload = {
            user: {
                id: user._id,
                role: user._role,
            }
        };
        jwt.sign(
            payload,
            process.env.JST_SECRET,
            { expiresIn: "1h" },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err){
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;