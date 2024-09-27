const { models } = require("../models");
const User = models.users;
const medical_centers = models.medical_centers;
const { hashingPassword } = require("../utils/passwordCrypt");

const UserService = {
    /**
     * 
     * @param {Object} user
     * @param {String} user.email
     * @param {String} user.role
     * @param {Number} user.center_id 
     * @param {String} user.password
     * @returns {Object} createdUser
     * @throws {Error} "Medical center not found", "User already exist", "Error occurred"
    */
    createUser: async (user) => {
        try {
            const userFound = await User.findOne({ where: { email: user.email } });
            if (userFound) {
                throw new Error("User already exist");
            }

            if (user.role === "doctor") {
                const center = await medical_centers.findOne({ where: { center_id: user.center_id } });
                if (!center) {
                    throw new Error("Medical center not found");
                }
            }

            user.password = await hashingPassword(user.password);

            return await User.create(user)
        } catch (err) {
            console.error("Error occurred", err);
            throw new Error(err.message);
        }
    },
    /**
    * 
    * @returns {Array}
    * @throws {Error} "Error occurred"
    */
    findUsers: async () => {
        try {
            return await User.findAll();
        } catch (err) {
            console.error("Error occurred", err);
            throw new Error(err.message)
        }
    },
    /**
     * 
     * @param {String} email 
     * @returns {Object} 
     * @throws {Error} "User not found", "Error occurred"
     */
    findUserByEmail: async (email) => {
        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                throw new Error("User not found");
            }
            return user;
        } catch (err) {
            console.error("Error occurred", err);
            throw new Error(err.message)
        }
    },
    /**
     * 
     * @param {Number} id 
     * @param {Object} updatedData 
     * @returns {Object}
     * @throws {Error} "User not found", "Error occurred"
     */
    updateUser: async (id, updatedData) => {
        try {
            const user = await User.findByPk(id);
            if (!user) {
                throw Error("User not found")
            }

            return await User.update(updatedData);
        } catch (err) {
            console.error("Error occurred", err);
            throw new Error(err.message)
        }
    }
}

module.exports = UserService;

// createUser создает пользователя в базе даных. findUsers возвращает всех пользователей
// Данные в сервис уже приходят проверенными.
// Можно создать три вида пользователя: Admin, Patient, Doctor. 
// Чтобы cоздать доктора, нужно чтобы был корректный существующий center_id
// Проверки: есть ли email в БД и есть center id в бд