// const TEST = require("../../tests/unit/services/patientService.test");
const sequelize = require("../config/db");
const db = require("../models");
const UserService = require("../services/userService");
const AddressService = require("../services/addressService");
const authMiddleware = require("../middleware/auth");

const PatientService = {
    /**
     * Регистрация пользователя и получение токена
     * @param {Object} userData 
     * @param {Object} patientData 
     * @param {Object} addressData 
     * @returns {String} token
     */
    createPatient: async (userData, patientData, addressData) => {
        const t = await sequelize.transaction();

        try {
            const createdUser = await UserService.createUser(userData, t);

            const createdPatient = await createdUser.createPatients(patientData, { transaction: t });

            await createdPatient.createAddress(addressData, t);

            await t.commit();
            return authMiddleware.createJWT(createdUser.id, createdUser.role);
        } catch (err) {
            await t.rollback();
            console.error("Error occurred", err);
            throw err;
        }
    },
    /**
     * Находит Пациента по id
     * @param {Number} id 
     * @returns {Object} Обьект patient
     */    
    getPatientById: async (id) => {
        try {
            const clinic = await db.Patients.findByPk(id);
            if (!clinic) {
                throw new Error("Patient not found");
            }
            return clinic;
        } catch (err) {
            throw err;
        }
    },
    /**
     * 
     * @param {Number} id 
     * @param {Object} userData 
     * @param {Object} patientData 
     * @param {Object} addressData 
     * @returns {Object}
     */
    updatePatient: async (user_id, userData, patientData, addressData) => {
        const t = await sequelize.transaction();

        try {
            const user = await UserService.updateUser(user_id, userData, t);

            const patient = await user.getPatients();
            if (!patient) {
                throw new Error("Patient not found");
            }
            await patient.update(patientData, { transaction: t });

            const address = await patient.getAddresses();
            if (address) {
                await AddressService.updateAddress(address, addressData, t);
            }

            await t.commit();
            return patient;
        } catch (err) {
            await t.rollback();
            console.error("Error occurred", err);
            throw err;
        }
    },

}

module.exports = PatientService;