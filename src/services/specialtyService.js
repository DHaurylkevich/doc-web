const db = require("../models");
const AppError = require("../utils/appError");

const SpecialtyService = {
    createSpecialty: async (specialtyData) => {
        try {
            return await db.Specialties.create(specialtyData);
        } catch (err) {
            throw err;
        }
    },
    getAllSpecialties: async () => {
        try {
            const specialties = await db.Specialties.findAll();
            if (!specialties) {
                throw new AppError("Specialty not found", 404);
            }

            return specialties;
        } catch (err) {
            throw err;
        }
    },
    getAllSpecialtiesByClinic: async (clinicId) => {
        try {
            const specialties = await db.Specialties.findAll({
                include: [
                    {
                        model: db.Services, as: "services",
                        where: { clinic_id: clinicId },
                    }
                ]
            });
            if (!specialties) {
                throw new AppError("Specialty not found", 404);
            }

            return specialties;
        } catch (err) {
            throw err;
        }
    },
    getSpecialtyById: async (id) => {
        try {
            const specialty = await db.Specialties.findByPk(id);
            if (!specialty) {
                throw new AppError("Specialty not found", 404);
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
                throw new AppError("Schedule not found", 404);
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
                throw new AppError("Schedule not found", 404);
            }

            await specialty.destroy();
        } catch (err) {
            throw err;
        }
    }
}

module.exports = SpecialtyService;