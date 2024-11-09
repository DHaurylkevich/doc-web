const MedicationService = require("../services/medicationService");

const MedicationController = {
    createMedication: async (req, res, next) => {
        const medicationData = req.body;
        
        try {
            const medication = await MedicationService.createMedication(medicationData);
            res.status(201).json({ message: "Medication created successfully", medication });
        } catch (err) {
            next(err);
        }
    },

    getMedicationById: async (req, res, next) => {
        const { medicationsId } = req.params;

        try {
            const medication = await MedicationService.getMedicationById(medicationsId);
            res.status(200).json(medication);
        } catch (err) {
            next(err);
        }
    },

    getAllMedications: async (req, res, next) => {
        try {
            const medications = await MedicationService.getAllMedications();
            res.status(200).json(medications);
        } catch (err) {
            next(err);
        }
    },

    updateMedication: async (req, res, next) => {
        const { medicationsId } = req.params;
        const medicationData = req.body;

        try {
            const medication = await MedicationService.updateMedication(medicationsId, medicationData);
            res.status(200).json({ message: "Medication updated successfully", medication });
        } catch (err) {
            next(err);
        }
    },

    deleteMedication: async (req, res, next) => {
        const { medicationsId } = req.params;

        try {
            const result = await MedicationService.deleteMedication(medicationsId);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }
};

module.exports = MedicationController;
