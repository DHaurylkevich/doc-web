const SpecialtyService = require("../services/specialtyService");

const SpecialtyController = {
    createSpecialty: async (req, res, next) => {
        const { specialtyData } = req.body;

        try {
            const specialty = await SpecialtyService.createSpecialty(specialtyData);
            res.status(201).json(specialty);
        } catch (err) {
            next(err);
        }
    },
    getSpecialty: async (req, res, next) => {
        const { id } = req.params;

        try {
            const specialty = await SpecialtyService.getSpecialtyById(id);
            res.status(200).json(specialty)
        } catch (err) {
            next(err);
        }
    },
    getAllSpecialties: async (req, res, next) => {
        try {
            const specialties = await SpecialtyService.getAllSpecialties();
            res.status(200).json(specialties)
        } catch (err) {
            console.log(err)
            next(err);
        }
    },
    updateSpecialty: async (req, res, next) => {
        const { id } = req.params;
        const { specialtyData } = req.body;

        try {
            const updateSpecialty = await SpecialtyService.updateSpecialty(id, specialtyData);
            res.status(200).json(updateSpecialty);
        } catch (err) {
            next(err);
        }
    },
    deleteSpecialty: async (req, res, next) => {
        const { id } = req.params;

        try {
            await SpecialtyService.deleteSpecialty(id);
            res.status(200).json({ message: "Successful delete" });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = SpecialtyController;