const UserService = require("../services/userService");
const passwordUtil = require("../utils/passwordUtil");
const AppError = require("../utils/appError");

const UserController = {
    /** Get user/clinic and his data by id and role */
    getUserAccount: async (req, res, next) => {
        const { userId } = req.params;

        try {
            const user = await UserService.getUserById(userId);
            res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    },
    updateUserPassword: async (req, res, next) => {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        try {
            if (!userId || !oldPassword || !newPassword) {
                throw new AppError("Valid data error", 400);
            }

            await UserService.updatePassword(userId, oldPassword, newPassword);
            res.status(200).json({ message: "Password changed successfully" });
        } catch (err) {
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
    // resetPassword: async (req, res) => {
    //     const { newPassword } = req.body;
    //     const userId = req.auth.id;
    //     try {
    //         const user = await UserService.getUserById(userId);
    //         user.password = await passwordUtil.hashingPassword(newPassword);
    //         await user.save();
    //         res.status(200).json({ message: "Пароль успешно сброшен" });
    //     } catch (err) {
    //         next(err)
    //     }
    // },
}

module.exports = UserController;