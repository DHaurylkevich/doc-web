const db = require("../models");
const AppError = require("../utils/appError");

const MedicationService = {
    createMedication: async (name) => {
        try {
            const medication = await db.Medications.findOne({
                where: {
                    name: name,
                }
            })
            if (medication) {
                throw new AppError("Mediation exists", 400);
            }

            return await db.Medications.create({ name: name });
        } catch (err) {
            throw err
        }
    },
    getAllMedications: async () => {
        try {
            return await db.Medications.findAll({ attributes: ["id", "name"] });
        } catch (err) {
            throw err;
        }
    },
    getMedicationById: async (medicationId) => {
        try {
            const medication = await db.Medications.findByPk(medicationId, { attributes: ["id", "name"] });
            if (!medication) {
                throw new AppError("Medication not found", 404);
            }
            return medication;
        } catch (err) {
            throw err;
        }
    },
    updateMedication: async (medicationId, medicationData) => {
        try {
            const medication = await db.Medications.findByPk(medicationId);
            if (!medication) {
                throw new AppError("Medication not found", 404);
            }
            return await medication.update(medicationData);
        } catch (err) {
            throw err;
        }
    },
    deleteMedication: async (medicationId) => {
        try {
            const medication = await db.Medications.findByPk(medicationId);
            if (!medication) {
                throw new AppError("Medication not found", 404);
            }

            await medication.destroy();
            return;
        } catch (err) {
            throw err;
        }
    }
};

module.exports = MedicationService;