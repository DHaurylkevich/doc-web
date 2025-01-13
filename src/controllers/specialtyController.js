const SpecialtyService = require("../services/specialtyService");

const SpecialtyController = {
    createSpecialty: async (req, res, next) => {
        const specialtyData = req.body;

        try {
            const specialty = await SpecialtyService.createSpecialty(specialtyData);
            res.status(201).json(specialty);
        } catch (err) {
            next(err);
        }
    },
    getSpecialty: async (req, res, next) => {
        const { specialtyId } = req.params;

        try {
            const specialty = await SpecialtyService.getSpecialtyById(specialtyId);
            res.status(200).json(specialty);
        } catch (err) {
            next(err);
        }
    },
    getAllSpecialties: async (req, res, next) => {
        try {
            const specialties = await SpecialtyService.getAllSpecialties();
            res.status(200).json(specialties);
        } catch (err) {
            console.log(err)
            next(err);
        }
    },
    getAllSpecialtiesByClinic: async (req, res, next) => {
        const { clinicId } = req.params;

        try {
            const specialties = await SpecialtyService.getAllSpecialtiesByClinic(clinicId);
            res.status(200).json(specialties);
        } catch (err) {
            console.log(err)
            next(err);
        }
    },
    updateSpecialty: async (req, res, next) => {
        const { specialtyId } = req.params;
        const specialtyData = req.body;

        try {
            const updateSpecialty = await SpecialtyService.updateSpecialty(specialtyId, specialtyData);
            console.log(updateSpecialty);
            res.status(200).json(updateSpecialty);
        } catch (err) {
            next(err);
        }
    },
    deleteSpecialty: async (req, res, next) => {
        const { specialtyId } = req.params;

        try {
            await SpecialtyService.deleteSpecialty(specialtyId);
            res.status(200).json({ message: "Specialty deleted successfully" });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = SpecialtyController;