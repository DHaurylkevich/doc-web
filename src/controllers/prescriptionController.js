// controllers/prescriptionController.js
const prescriptionService = require("../services/prescriptionService");

const prescriptionController = {
    createPrescription: async (req, res, next) => {
        try {
            //TODO: expirationDate обязательное поле
            const { patientId, doctorId, medicationId, expirationDate } = req.body;
            const prescription = await prescriptionService.createPrescription(
                patientId, doctorId, medicationId, expirationDate
            );
            return res.status(201).json({ message: "Рецепт успешно создан", prescription });
        } catch (err) {
            next(err);
        }
    },
    getPrescriptionsByPatient: async (req, res, next) => {
        try {
            const { patientId } = req.params;
            const { limit = 10, offset = 0 } = req.query;

            const prescriptions = await prescriptionService.getPrescriptionsByPatient({ patientId, limit, offset });
            return res.status(200).json(prescriptions);
        } catch (err) {
            next(err);
        }
    },
    getPrescriptionsByDoctor: async (req, res, next) => {
        try {
            const { doctorId } = req.params;
            const { sort = 'ASC', limit = 10, offset = 0 } = req.query;

            const prescriptions = await prescriptionService.getPrescriptionsByDoctor({ doctorId, sort, limit, offset });
            return res.status(200).json(prescriptions);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = prescriptionController;
