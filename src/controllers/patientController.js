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
    getPatientById: async (req, res, next) => {
        const { userId } = req.params;

        try {
            const patient = await PatientService.getPatientById(userId);
            res.status(200).json(patient)
        } catch (err) {
            next(err);
        }
    },
    getPatientsFilter: async (req, res, next) => {
        const { sort, limit, page, doctorId, clinicId } = req.query;

        try {
            const patients = await PatientService.getPatientsByParam({ sort, limit, page, doctorId, clinicId });
            res.status(200).json(patients)
        } catch (err) {
            next(err);
        }
    },
    getAllPatientsForAdmin: async (req, res, next) => {
        const { sort, gender, limit, page } = req.query;

        try {
            const patients = await PatientService.getAllPatientsForAdmin({ sort, gender, limit, page });
            res.status(200).json(patients);
        } catch (err) {
            next(err);
        }
    }
};

module.exports = PatientController;