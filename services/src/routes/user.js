const express = require("express");
const router = express.Router();
// import { v4 as uuidv4 } from 'uuid';
const userController = require("../controllers/userController");

router.post("/register", userController.registerUser);

router.post("/login", async (req, res) => {

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