const TEST = require("../../tests/unit/controllers/usersController.test.js");
const UserService = require("../services/userService");
const authMiddleware = require("../middleware/auth");
const passwordUtil = require("../utils/passwordUtil");

const UserController = {
    // const User = require("../models/user");
    // const { validationResult } = require("express-validator");
    // const jwt = require("jsonwebtoken");
    // const { validationResult } = require('express-validator');
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
     * Вход пользователя
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
        } catch (err) {
            next(err);
        }
    },

    getUserById: async (req, res, next) => {
        const { id } = req.params;
        try {
            const user = await UserService.findUserById(id);
            res.status(200).json(user);
        } catch (err) {
            console.error(err);
            next(err);
        }
    },
    /**
     * Обновление паролей
     * @param {Number} req.param.id 
     * @param {String} req.body.oldPassword 
     * @param {String} req.body.newPassword
     * @returns status(200), message: "Password changed successfully"  
     */
    updateUserPassword: async (req, res, next) => {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;
        try {
            if (!id || !oldPassword || !newPassword) {
                throw new Error("Valid data error");
            }

            await UserService.updatePassword(id, oldPassword, newPassword);
            res.status(200).json({ message: "Password changed successfully" });
        } catch (err) {
            next(err);
        }
    },

    deleteUser: async (req, res, next) => {
        const { id } = req.params;
        try {
            await UserService.deleteUser(id);
            res.status(200).json({ message: "Successful delete" });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = UserController;