const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = mongoose.model("../model/User");

router.post("/users", async (req, res) => {
    try{
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({message: "Не хватает обязательных полей: name, email, password" })
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: " Пользователь с таким email уже существует"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        const saveUser = await user.save();
        res.status(201).send(saveUser);
    }catch (err){
        console.error(err);
        res.status(500).json( {message: err.message});
    }
});

router.get("/users", async (req, res) => {
    try{
        const users = await User.find().lean().exec();
        res.status(200).json(users);
    }catch (err){
        console.error(err);
        res.status(500).json({message: err.message});
    }
});

router.get("/users/:id", async (req, res) => {
    try{
        const user = await User.findById(req.params.id).lean().exec();
        if (!user){
            return res.status(200).json({message: "Пользователь не найден"})
        }
        res.status(200).json(user);
    }catch (err){
        console.error(err);
        res.status(500).json({message: err.message});
    }
});

router.put("/users/:id", async (req, res) => {
    try{
        const { name, email, roles } = req.body;
        const updateUser = await User.findByIdAndUpdate(
            req.param.id,
            {   name, email, roles},
            { new: true, runValidators: true }
        ).lean().exec();

        if (!updateUser) {
            return res.status(404).json({message: "Запись не найдена"})
        }
        res.status(201).send(updateUser);
    }catch (err){
        console.error(err);
        res.status(500).json({message : err.message});
    }
});

router.delete("/users/:id", async (req, res) => {
    try{
        const user = await User.findById(req.params.id).lean().exec();
        if (!user) {
            return res.status(404).json({message: "Запись не найдена"})
        }

        await User.findByIdAndDelete(req.params.id).lean().exec();

        res.status(201).send({ message: "Запись удалена" });
    }catch (err){
        console.error(err);
        res.status(500).json({ message : err.message });
    }
});

module.exports = router;