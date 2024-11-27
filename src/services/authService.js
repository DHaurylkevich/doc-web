const AppError = require("../utils/appError");
const db = require("../models");
const sequelize = require("../config/db");
const createJWT = require("../utils/createJWT");
const { hashingPassword } = require("../utils/passwordUtil");
const { resetMail } = require("../utils/mail");
const jwt = require("jsonwebtoken");

const AuthService = {
    requestPasswordReset: async (email) => {
        const t = await sequelize.transaction();

        try {
            const user = await db.Users.findOne({ where: { email: email, transaction: t } });
            if (user) {
                const resetToken = createJWT(user.id, user.role);
                await user.update({ resetToken }, { transaction: t });
            } else {
                const clinic = await db.Clinics.findOne({ where: { email: email, transaction: t } });
                if (clinic) {
                    throw new AppError("User not found", 404);
                }
                const resetToken = createJWT(clinic.id, clinic.role);
                await clinic.update({ resetToken }, { transaction: t });
            }

            await t.commit();

            await resetMail(email, resetToken);
            return;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    setPassword: async (token, newPassword) => {
        const t = await sequelize.transaction();
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const role = decoded.role;
            const id = decoded.id;

            let user;
            if (role === "user") {
                user = await db.Users.findOne({ where: { id: id, transaction: t }, attributes: ["id", "resetToken"] });
            } else {
                user = await db.Clinics.findOne({ where: { id: id, transaction: t }, attributes: ["id", "resetToken"] });
            }

            if (!user || user.resetToken !== token) {
                throw new AppError("Invalid token", 400);
            }

            const hashedPassword = await hashingPassword(newPassword);
            await user.update({ password: hashedPassword, resetToken: null }, { transaction: t });

            await t.commit();
            return;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }
}

module.exports = AuthService;