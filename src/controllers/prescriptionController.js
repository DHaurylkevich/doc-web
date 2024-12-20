const prescriptionService = require("../services/prescriptionService");

const prescriptionController = {
    createPrescription: async (req, res, next) => {
        try {
            const { patientId, medicationId, expirationDate } = req.body;
            const doctorId = req.user.roleId;

            await prescriptionService.createPrescription(patientId, doctorId, medicationId, expirationDate);
            return res.status(201).json({ message: "Prescription created successful" });
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
                prescriptions = await prescriptionService.getPrescriptionsByPatient({ patientId: user.roleId, sort, limit, page });
            } else {
                prescriptions = await prescriptionService.getPrescriptionsByDoctor({ doctorId: user.roleId, sort, limit, page });
            }

            return res.status(200).json(prescriptions);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = prescriptionController;
