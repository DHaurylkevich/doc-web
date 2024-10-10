// const User = require("../models/user");
// const { validationResult } = require("express-validator");
// const jwt = require("jsonwebtoken");
// const { validationResult } = require('express-validator');
const UserService = require("../services/userService");
const authMiddleware = require("../middleware/auth");
const passwordUtil = require("../utils/passwordUtil");

const UserController = {
    // registerUser: async (req, res, next) => {
    //     try {
    //         const user = await UserService.createUser(req.body);

    //         const token = authMiddleware.createJWT(user.id, user.role);
    //         res.status(201).json(token);
    //     } catch (error) {
    //         next(error);
    //     }
    // },

    /**
     * Через валидацию проверяются данные для входа и передаются сюда в параметре loginParam
     * @param {String} loginParam 
     * @param {String} password
     * @param {*} next 
     */
    loginUser: async (req, res, next) => {
        const { loginParam, password } = req.body;
    
        try {
            let user = await UserService.findUserByParam(loginParam);

            passwordUtil.checkingPassword(password, user.password);

            const token = authMiddleware.createJWT(user.id, user.role);
            res.status(200).json(token);
        } catch (error) {
            next(error);
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