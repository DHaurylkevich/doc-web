const PatientService = require("../services/patientService");

const PatientController = {
    /**
     * Вход пользователя
     * @param {String} loginParam 
     * @param {String} password
     * @param {*} next 
     */
    registrationPatient: async (req, res, next) => {
        const { userData, patientData } = req.body;

        try {
            const userToken = await PatientService.createPatient(userData, patientData);
            res.status(201).json(userToken);
        } catch (err) {
            next(err);
        }
    },
    getPatientsFilter: async (req, res, next) => {
        const { sort = 'asc', limit = 10, offset = 0, doctorId, clinicId } = req.query;

        try {
            const patients = await PatientService.getPatientsByParam({ sort, limit, offset, doctorId, clinicId });
            res.status(200).json(patients)
        } catch (err) {
            next(err);
        }
    },
    getPatientById: async (req, res, next) => {
        const { userId } = req.params;

        try {
            const patient = await PatientService.getPatientById(userId);
            res.status(200).json(patient)
        } catch (err) {
            console.log(err);
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
        const { userId } = req.params;
        const { userData, patientData, addressData } = req.body;
        const image = req.file ? req.file.path : null;

        try {
            const updatePatient = await PatientService.updatePatient(image, userId, userData, patientData, addressData)

            res.status(200).json(updatePatient);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = PatientController;