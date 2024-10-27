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
            const createdDoctor = await DoctorService.createDoctor(userData, doctorData, specialty_id, clinic_id);
            res.status(201).json(createdDoctor);
        } catch (err) {
            next(err);
        }
    },
    /**
     * Обновление данных доктора
     * @param {*} req praram{ id } ,body{ userData, doctorData }
     * @param {*} res 
     * @param {*} next 
     */
    updateDoctorById: async (req, res, next) => {
        const { id } = req.params;
        const { userData, doctorData } = req.body;

        try {
            const updatedDoctor = await DoctorService.updateDoctor(id, userData, doctorData);

            res.status(200).json(updatedDoctor);
        } catch (err) {
            next(err);
        }
    },
}

module.exports = DoctorController;