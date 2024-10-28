// const TEST = require("../../tests/unit/services/usersService.test");
const { Op } = require("sequelize");
const db = require("../models");
const passwordUtil = require("../utils/passwordUtil");

const UserService = {
    /**
     * createUser создает транзакцию создания пользователя в базе даных.
     * @param {Object} user
     * @param {Transaction} t
     * @param {String} user.email
     * @param {String} user.password
     * @returns {Object} createdUser
     * @throws {Error} "User already exist", "Error occurred"
    */
    createUser: async (userData, t) => {
        try {
            const foundUser = await db.Users.findOne({ where: { pesel: userData.pesel } });
            if (foundUser) {
                throw new Error("User already exist");
            }

            userData.password = await passwordUtil.hashingPassword(userData.password);
            return await db.Users.create(userData, { transaction: t });
        } catch (err) {
            console.error("Error occurred", err);
            throw err;
        }
    },
    /**
    * findUsers возвращает массив всех пользователей
    * @returns {Array}
    * @throws {Error} "Error occurred"
    */
    findAllUsers: async () => {
        try {
            return await db.Users.findAll();
        } catch (err) {
            console.error("Error occurred", err);
            throw new Error(err.message)
        }
    },
    getUserById: async (id) => {
        try {
            const user = await db.Users.findByPk(id);
            if (!user) {
                throw new Error("User not found");
            }
            return user;
        } catch (err) {
            console.error("Error occurred", err);
            throw err;
        }
    },
    /**
     * Возвращает даные пользователя с данными его роли
    * @param {number} id - ID пользователя
    * @param {string} role - Роль пользователя ("patient", "doctor", "admin")
    * @returns {Promise<Object>} - Данные пользователя с его ролью
    */
    getRoleUserById: async (id, role) => {
        let user;
        try {
            switch (role) {
                case "patient":
                    user = await db.Users.findOne({
                        where: { id },
                        include: [db.Patients],
                    });
                    break;
                case "doctor":
                    user = await db.Users.findOne({
                        where: { id },
                        include: [db.Doctors],
                    });
                    break;
                case "admin":
                    user = await db.Users.findByPk(id);
                    break;
                default:
                    throw new Error("Invalid role specified");
            }

            if (!user) {
                throw new Error("User not found");
            }
            return user;
        } catch (err) {
            console.error("Error occurred", err);
            throw err;
        }
    },
    /**
     * Возвращает объект пользователя по параметру email/phone/pesel
     * @param {String} param 
     * @returns {Object} 
     * @throws {Error} "User not found", "Error occurred"
     */
    findUserByParam: async (param) => {
        try {
            let user = await db.Users.findOne({ where: { [Op.or]: [{ email: param }, { phone: param }, { pesel: param }] } });

            if (!user) {
                user = await db.Clinics.findOne({ where: { [Op.or]: [{ email: param }, { phone: param }] } });
                if (!user) {
                    throw new Error("User not found");
                }
            }
            return user;
        } catch (err) {
            console.error("Error occurred", err);
            throw new Error(err.message)
        }
    },
    /**
     * Возвращает обновленный объект пользователя
     * @param {Number} id 
     * @param {Object} updatedData 
     * @returns {Object}
     * @throws {Error} "User not found", "Error occurred"
     */
    updateUser: async (id, updatedData, t) => {
        try {
            const user = await db.Users.findByPk(id);
            if (!user) {
                throw Error("User not found")
            }
            await user.update(updatedData, { transaction: t, returning: true })

            return user;
        } catch (err) {
            console.error("Error occurred", err);
            throw new Error(err.message)
        }
    },
    /**
     *  На фронте должна быть проверка одинаковы ли все пароли введенные 
     * @param {Number} id 
     * @param {String} oldPassword 
     * @param {String} newPassword 
     */
    updatePassword: async (id, oldPassword, newPassword) => {
        try {
            const user = await db.Users.findByPk(id);
            if (!user) {
                throw Error("User not found")
            }
            
            passwordUtil.checkingPassword(oldPassword, user.password);
            newPassword = await passwordUtil.hashingPassword(newPassword);

            return await user.update({ password: newPassword });
        } catch (err) {
            console.error("Error occurred", err);
            throw new Error(err.message)
        }
    },
    /**
     * Удаляет существующего пользователя из базы данных
     * @param {Number} id 
     * @returns {Object} {message: "Successful delete"}
     * @throws {Error}  "User not found", "Error occurred"
     */
    deleteUser: async (id) => {
        try {
            const user = await db.Users.findByPk(id)
            if (!user) {
                throw Error("User not found")
            }

            await user.destroy();

            return;
        } catch (err) {
            console.error("Error occurred", err);
            throw new Error(err.message)
        }
    }
}

module.exports = UserService;

// Данные в сервис уже приходят проверенными.
// Можно создать три вида пользователя: Admin, Patient, Doctor. 
// Чтобы cоздать доктора, нужно чтобы был корректный существующий center_id
// Проверки: есть ли email в БД и есть center id в бд