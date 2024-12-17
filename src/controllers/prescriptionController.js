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
    getPrescriptions: async (req, res, next) => {
        try {
            const user = req.user;
            const { sort = 'ASC', limit, page } = req.query;
            let prescriptions;
            if (user.role === "patient") {
                prescriptions = await prescriptionService.getPrescriptionsByPatient({ userId: user.id, sort, limit, page });
            } else {
                prescriptions = await prescriptionService.getPrescriptionsByDoctor({ userId: user.id, sort, limit, page });
            }

            return res.status(200).json(prescriptions);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = prescriptionController;
