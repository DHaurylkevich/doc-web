const PatientService = require("../services/patientService");

const PatientController = {
    registrationPatient: async (req, res, next) => {
        const { userData, addressData } = req.body;

        try {
            const user = await PatientService.createPatient(userData, addressData);
            res.status(201).json(user);
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
            next(err);
        }
    },
    updatePatientById: async (req, res, next) => {
        const { userId } = req.params;
        const { userData, addressData } = req.body;
        const image = req.file ? req.file.path : null;
        
        try {
            console.log("userData:", req.body.userData);
            const updatePatient = await PatientService.updatePatient(image, userId, userData, addressData)

            res.status(200).json(updatePatient);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = PatientController;