const db = require("../models");
const AppError = require("../utils/appError");

const SpecialtyService = {
    createSpecialty: async (specialtyData) => {
        try {
            const specialtyExist = await db.Specialties.findOne({ where: { name: specialtyData.name } });
            if (specialtyExist) {
                throw new AppError("Specialty already exists", 409);
            }

            const specialty = await db.Specialties.create(specialtyData);
            return { id: specialty.id, name: specialty.name }
        } catch (err) {
            throw err;
        }
    },
    getAllSpecialties: async () => {
        try {
            return await db.Specialties.findAll({ attributes: ["id", "name"] });
        } catch (err) {
            throw err;
        }
    },
    getAllSpecialtiesByClinic: async (clinicId) => {
        try {
            const specialties = await db.Specialties.findAll({
                attributes: ["id", "name"],
                include: [
                    {
                        model: db.Services, as: "services",
                        attributes: ["id", "name", "price"],
                        where: { clinic_id: clinicId },
                    }
                ]
            });

            return specialties;
        } catch (err) {
            throw err;
        }
    },
    getSpecialtyById: async (specialtyId) => {
        try {
            const specialty = await db.Specialties.findByPk(specialtyId);
            if (!specialty) {
                throw new AppError("Specialty not found", 404);
            }

            return specialty;
        } catch (err) {
            throw err;
        }
    },
    updateSpecialty: async (specialtyId, data) => {
        try {
            const specialty = await db.Specialties.findByPk(specialtyId);
            if (!specialty) {
                throw new AppError("Specialty not found", 404);
            }

            await specialty.update(data);
            return;
        } catch (err) {
            throw err;
        }
    },
    deleteSpecialty: async (specialtyId) => {
        try {
            const specialty = await db.Specialties.findByPk(specialtyId);
            if (!specialty) {
                throw new AppError("Specialty not found", 404);
            }

            await specialty.destroy();
            return;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = SpecialtyService;