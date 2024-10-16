// const TEST = require("../../tests/unit/controllers/patientController.test.js");
const DoctorService = require("../services/doctorService");

const DoctorController = {
    /**
     * Вход пользователя
     * @param {Object} userData 
     * @param {Object} patientData
     * @param {Object} specialty_id
     * @param {Number} clinic_id
     * @param {*} next 
     */
    createDoctor: async (req, res, next) => {
        const { userData, doctorData, specialty_id, clinic_id } = req.body;

        try {
            const createdDoctor = await DoctorService.createDoctorByClinic(userData, doctorData, specialty_id, clinic_id);
            res.status(201).json(createdDoctor);
        } catch (err) {
            next(err);
        }
    },
}

module.exports = DoctorController;