// const User = require("../models/user");
// const checkingPassword = require("../utils/passwordOperation");
// const { validationResult } = require("express-validator");
// const jwt = require("jsonwebtoken");
const UserService = require("../services/userService");

const UserController = {
    registerUser: async (req, res, next) => {
        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     return res.status(400).json({ errors: errors.array() });
        // }
        const { name, email, password, role } = req.body;

        try {
            // if (!name || !email || !password) {
            //     return res.status(400).json({ message: "Не хватает обязательных полей: name, email, password" })
            // }

            const user = await UserService.createUser(req.body);

            // const payload = { user: { id: user.id, role: user.name } };
            // jwt.sign(payload, process.env.JWT_AUTH_TOKEN, { expiresIn: "1h" }, (error, token) => {
            //     if (error) throw error;
            //     res.status(201).json(token);
            // });
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    },

    loginUser: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email }).lean().exec();
            if (!user) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            const isMatch = await checkingPassword(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const payload = { user: { id: user.id, role: user.name } };
            jwt.sign(payload, process.env.JWT_AUTH_TOKEN, { expiresIn: "1h" }, (error, token) => {
                if (error) throw error;
                res.status(201).json(token);
            });
        } catch (err) {
            next(err);
        }
    },

    //Получить список всех пациентов, наверное смотреть может только Админ
    getAllUser: async (res, req) => {
        try {
            const users = await User.find().lean().exec();
            res.status(200).json(users);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }
}

module.exports = UserController;


//registerUser добавляет пользователя и создает JWT токен,  
//Данные должны проверяться другим  на корректность в middleware
//Возращает токен и пользователя 