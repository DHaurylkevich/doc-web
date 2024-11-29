const { Op } = require("sequelize");
const db = require("../models");
const passwordUtil = require("../utils/passwordUtil");
const bcrypt = require("bcrypt");
const cloudinary = require("../middleware/upload");
const AppError = require("../utils/appError");

const UserService = {
    createUser: async (userData, t) => {
        try {
            const foundUser = await db.Users.findOne({ where: { pesel: userData.pesel } });
            if (foundUser) {
                throw new AppError("User already exist", 404);
            }

            userData.password = await passwordUtil.hashingPassword(userData.password);
            return await db.Users.create(userData, { transaction: t });
        } catch (err) {
            throw err;
        }
    },
    findAllUsers: async () => {
        try {
            return await db.Users.findAll();
        } catch (err) {
            throw err;
        }
    },
    getUserById: async (userId) => {
        try {
            const user = await db.Users.findByPk(userId,
                {
                    attributes: { exclude: ['password', "createdAt", "updatedAt"] },
                    include: [{
                        model: db.Addresses,
                        as: 'address',
                        attributes: { exclude: ['createdAt', 'updatedAt', "clinic_id", "user_id"] }
                    }]
                }
            );
            if (!user) {
                throw new AppError("User not found", 404);
            }
            return user;
        } catch (err) {
            throw err;
        }
    },
    findUserByParam: async (param) => {
        try {
            let user = await db.Users.findOne({ where: { [Op.or]: [{ email: param }, { phone: param }, { pesel: param }] } });

            if (!user) {
                user = await db.Clinics.findOne({ where: { [Op.or]: [{ email: param }, { phone: param }] } });
            }

            return user;
        } catch (err) {
            throw err;
        }
    },
    updateUser: async (image, userId, updatedData, t) => {
        try {
            const user = await db.Users.findByPk(userId);
            if (!user) {
                throw new AppError("User not found", 404);
            }

            if (image && image !== user.photo) {
                updatedData.photo = image;
                console.log('Calling deleteFromCloud...');

                await cloudinary.deleteFromCloud(user.photo);
            }

            await user.update(updatedData, { transaction: t, returning: true })

            return user;
        } catch (err) {
            throw err;
        }
    },
    updatePassword: async (userId, oldPassword, newPassword) => {
        try {
            const user = await db.Users.findByPk(userId);
            if (!user) {
                throw new AppError("User not found", 404);
            }

            const match = await bcrypt.compare(oldPassword, user.password);
            if (!match) {
                throw new AppError("Password Error", 400);
            };

            newPassword = await passwordUtil.hashingPassword(newPassword);
            return await user.update({ password: newPassword });
        } catch (err) {
            throw err;
        }
    },
    deleteUser: async (userId) => {
        try {
            const user = await db.Users.findByPk(userId)
            if (!user) {
                throw new AppError("User not found", 404);
            }

            await user.destroy();
            return { message: "Successful delete" };
        } catch (err) {
            throw err;
        }
    }
}

module.exports = UserService;