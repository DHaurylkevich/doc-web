// const TEST = require("../../tests/unit/controllers/patientController.test.js");
const PatientService = require("../services/patientService");

const PatientController = {
    /**
     * Вход пользователя
     * @param {String} loginParam 
     * @param {String} password
     * @param {*} next 
     */
    registrationPatient: async (req, res, next) => {
        const { userData, patientData, addressData } = req.body;

        try {
            const userToken = await PatientService.createPatient(userData, patientData, addressData);
            res.status(201).json(userToken);
        } catch (err) {
            next(err);
        }
    },
    /**
     * id User
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @returns 
     */
    updatePatientById: async (req, res, next) => {
        const { id } = req.params;
        const { userData, patientData, addressData } = req.body;

        try {
            const updatePatient = await PatientService.updatePatient(id, userData, patientData, addressData)

            res.status(200).json(updatePatient);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = PatientController;