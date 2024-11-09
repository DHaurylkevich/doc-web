// services/medicationService.js

const db = require("../models");

const MedicationService = {
    createMedication: async (medicationData) => {
        return await db.Medications.create(medicationData);
    },

    getMedicationById: async (medicationsId) => {
        const medication = await db.Medications.findByPk(medicationsId);
        if (!medication) {
            throw new Error("Medication not found");
        }
        return medication;
    },

    getAllMedications: async () => {
        return await db.Medications.findAll();
    },

    updateMedication: async (medicationsId, medicationData) => {
        const medication = await db.Medications.findByPk(medicationsId);
        if (!medication) {
            throw new Error("Medication not found");
        }
        return await medication.update(medicationData);
    },

    deleteMedication: async (medicationsId) => {
        const medication = await db.Medications.findByPk(medicationsId);
        if (!medication) {
            throw new Error("Medication not found");
        }
        await medication.destroy();
        return { message: "Medication deleted successfully" };
    }
};

module.exports = MedicationService;