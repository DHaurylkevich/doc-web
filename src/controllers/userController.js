const UserService = require("../services/userService");
const ClinicService = require("../services/clinicService");
const passwordUtil = require("../utils/passwordUtil");
const AppError = require("../utils/appError");

const UserController = {
    getUserAccount: async (req, res, next) => {
        const user = req.user;

        try {
            let userInDb;

            if (user.role === "clinic") {
                userInDb = await ClinicService.getClinicById(user.id);
            } else {
                userInDb = await UserService.getUserById(user.id);
            }

            res.status(200).json(userInDb);
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
}

module.exports = UserController;