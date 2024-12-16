const UserService = require("../services/userService");
const ClinicService = require("../services/clinicService");
const AppError = require("../utils/appError");

const UserController = {
    getUserAccount: async (req, res, next) => {
        const user = req.user;

        try {
            let userInDb;

            if (user.role === "clinic") {
                userInDb = await ClinicService.getClinicById(user.id);
            } else {
                userInDb = await UserService.getUserById(user.id, user.role);
            }

            res.status(200).json(userInDb);
        } catch (err) {
            next(err);
        }
    },
    updateUser: async (req, res, next) => {
        const { userData, addressData, doctorData } = req.body;
        const user = req.user;

        try {
            if ("password" in userData) {
                delete userData.password;
            }

            if (user.role === "clinic") {
                await ClinicService.updateClinic(user.id, userData, addressData);
            } else {
                await UserService.updateUser(user.id, userData, addressData, doctorData);
            }
            res.status(200).json({ message: "User update successfully" });
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
        const user = req.user;
        try {
            if (user.role === "clinic") {
                await ClinicService.deleteClinicById(user.id);
            } else {
                await UserService.deleteUserById(user.id);
            }

            res.status(200).json({ message: "Successful delete" });
        } catch (err) {
            next(err);
        }
    },
    updateImage: async (req, res, next) => {
        const userId = req.user.id;
        const image = req.file ? req.file.path : null;

        try {
            await UserService.updateImage(userId, image);
            res.status(200).json("Image uploaded successfully");
        } catch (err) {
            next(err);
        }
    }
}

module.exports = UserController;