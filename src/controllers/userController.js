const UserService = require("../services/userService");
const passport = require('passport');
const { createJWT } = require("../middleware/auth");
const passwordUtil = require("../utils/passwordUtil");
const AppError = require("../utils/appError");

const UserController = {
    // /**
    //  * Вход пользователя
    //  * @param {String} loginParam 
    //  * @param {String} password
    //  * @param {*} next 
    //  */
    // loginUser: async (req, res, next) => {
    //     passport.authenticate('local', (err, user, info) => {
    //         if (err) return next(err);
    //         if (!user) return next(new AppError(info.message, 401));
            
    //         req.logIn(user, (err) => {
    //             if (err) return next(err);
    //             return res.status(200).json({
    //                 message: 'Успешный вход',
    //                 user: {
    //                     id: user.id,
    //                     email: user.email,
    //                     role: user.role,
    //                     first_name: user.first_name,
    //                     last_name: user.last_name
    //                 }
    //             });
    //         });
    //     })(req, res, next);
    // },
    /**
     * Получение объекта user и данных по его id и role
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    getUserAccount: async (req, res, next) => {
        const { userId } = req.params;

        try {
            const user = await UserService.getUserById(userId);
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
        const { oldPassword, newPassword } = req.body;
        const userId = req.auth.id;
        try {
            if (!userId || !oldPassword || !newPassword) {
                throw new AppError("Valid data error", 400);
            }

            await UserService.updatePassword(userId, oldPassword, newPassword);
            res.status(200).json({ message: "Password changed successfully" });
        } catch (err) {
            console.log(err);
            next(err);
        }
    },
    deleteUser: async (req, res, next) => {
        const { userId } = req.params;
        try {
            const result = await UserService.deleteUser(userId);

            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },
    requestPasswordReset: async (req, res, next) => {
        const { email } = req.body;

        try {
            await UserService.requestToMail(email);

            res.status(200).json({
                status: "success",
                message: "Password reset link has been sent to your email address",
            });
        } catch (err) {
            next(err);
        }
    },
    resetPassword: async (req, res) => {
        const { newPassword } = req.body;
        const userId = req.auth.id;

        try {

            const user = await UserService.getUserById(userId);

            user.password = await passwordUtil.hashingPassword(newPassword);
            await user.save();

            res.status(200).json({ message: "Пароль успешно сброшен" });
        } catch (err) {
            next(err)
        }
    },
}

module.exports = UserController;