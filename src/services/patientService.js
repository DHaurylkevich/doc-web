const TEST = require("../../tests/unit/services/usersService.test");
const db = require("../models");
const sequelize = require("../config/db");
const UserService = require("../services/userService");
const AddressService = require("../services/addressService");
const tokenUtil = require("../middleware/auth");

const PatientService = {
    /**
     * Регистрация пользователя и получение токена
     * @param {Object} userData 
     * @param {Object} patientData 
     * @param {Object} addressData 
     * @returns {String} token
     */
    registerPatient: async (userData, patientData, addressData) => {
        const t = await sequelize.transaction();

        try {
            const createdUser = await UserService.createUser(userData, t);

            const createdAddress = await AddressService.createAddress(addressData, t);

            patientData.user_id = createdUser.id;
            patientData.address_id = createdAddress.id;
            await db.Patients.create(patientData, { transaction: t });

            await t.commit();
            const token = tokenUtil.createJWT(createdUser.id, createdUser.role);
            return token;
        } catch (err) {
            await t.rollback();
            console.error("Error occurred", err);
            throw new Error(err.message);
        }
    },
    updatePatient: async (id, userData, patientData, addressData) => {
        const t = await sequelize.transaction();

        try {
            const foundPatient = await db.Patients.findByPk(id);
            if (!foundPatient) {
                throw new Error("Patient not found")
            }

            await UserService.updateUser(foundPatient.user_id, userData, t);
            await AddressService.updateAddress(foundPatient.address_id, addressData, t)
            await foundPatient.update(patientData, t);

            await t.commit();
            return foundPatient;
        } catch (err) {
            await t.rollback();
            console.error("Error occurred", err);
            throw err;
        }
    }
}

module.exports = PatientService;