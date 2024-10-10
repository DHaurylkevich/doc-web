const { Op } = require("sequelize");
const { models } = require("../models");
const User = models.users;
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
    createUser: async (user, t) => {
        try {
            const userFound = await User.findOne({ where: { email: user.email } });
            if (userFound) {
                throw new Error("User already exist");
            }

            user.password = await passwordUtil.hashingPassword(user.password);

            return await User.create(user, { transaction: t });
        } catch (err) {
            console.error("Error occurred", err);
            throw new Error(err.message);
        }
    },
    /**
    * findUsers возвращает массив всех пользователей
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
     * findUSerByParam возвращает объект пользователя
     * @param {String} param 
     * @returns {Object} 
     * @throws {Error} "User not found", "Error occurred"
     */
    findUserByParam: async (param) => {
        try {
            const user = await User.findOne({ where: { [Op.or]: [{ email: param }, { phone: param }, { pesel: param }] } });

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
     * ВОЗМОЖНО НАДО ОПРЕДЕЛИТЬ ИМЕННО ЧТО ОБНОВЛЯЕТСЯ
     * updateUser возвращает обновленный объект пользователя
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
    },
    /**
     *  На фронте должна быть проверка одинаковы ли все пароли введенные 
     * @param {Number} id 
     * @param {String} oldPassword 
     * @param {String} newPassword 
     */
    updatePassword: async (id, oldPassword, newPassword) => {
        try{
            const user = await User.findByPk(id);
            if (!user) {
                throw Error("User not found")
            }

            passwordUtil.checkingPassword(oldPassword, user.password);

            newPassword = passwordUtil.hashingPassword(newPassword);

            return await User.update({ password: newPassword });
        }catch(err){
            console.error("Error occurred", err);
            throw new Error(err.message)
        }
    },
    /**
     * deleteUser удаляет существующего пользователя из базы данных
     * @param {Number} id 
     * @returns {Object} {message: "Successful delete"}
     * @throws {Error}  "User not found", "Error occurred"
     */
    deleteUser: async (id) => {
        try {
            const user = await User.findByPk(id)
            if (!user) {
                throw Error("User not found")
            }

            await user.destroy();
            return { message: "Successful delete" }
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