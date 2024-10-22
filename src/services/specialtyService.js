// const TEST = require("../../tests/unit/services/doctorService.test");
const db = require("../models");

const SpecialtyService = {
    createSpecialty: async (name) => {
        try {
            return await db.Specialties.create(name);
        } catch (err) {
            throw err;
        }
    },
    getSpecialtyById: async (id) => {
        try {
            const specialty = await db.Specialties.findByPk(id);
            if (!specialty) {
                throw new Error("Specialty not found");
            }

            return specialty;
        } catch (err) {
            throw err;
        }
    },
    updateSpecialty: async (id, data) => {
        try {
            let specialty = await db.Specialties.findByPk(id);
            if (!specialty) {
                throw new Error("Schedule not found");
            }

            specialty = await specialty.update(data);

            return specialty;
        } catch (err) {
            throw err;
        }
    },
    deleteSpecialty: async (id) => {
        try {
            let specialty = await db.Specialties.findByPk(id);
            if (!specialty) {
                throw new Error("Schedule not found");
            }

            await specialty.destroy();
        } catch (err) {
            throw err;
        }
    }
}

module.exports = SpecialtyService;