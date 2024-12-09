const DoctorService = require("../services/doctorService");

const DoctorController = {
    createDoctor: async (req, res, next) => {
        const { clinicId } = req.params;
        const { userData, addressData, doctorData, specialtyId, servicesIds } = req.body;

        try {
            await DoctorService.createDoctor({ userData, addressData, doctorData, specialtyId, clinicId, servicesIds });

            res.status(201).json({ message: "Doctor created successful" });
        } catch (err) {
            next(err);
        }
    },
    getDoctorById: async (req, res, next) => {
        const { doctorId } = req.params;

        try {
            const createdDoctor = await DoctorService.getDoctorById(doctorId);
            res.status(200).json(createdDoctor);
        } catch (err) {
            next(err);
        }
    },
    updateDoctorById: async (req, res, next) => {
        const { userId } = req.params;
        const { userData, addressData, doctorData, servicesIds } = req.body;

        try {
            const updateDoctor = await DoctorService.updateDoctorById({ userId, userData, addressData, doctorData, servicesIds });

            res.status(200).json(updateDoctor);
        } catch (err) {
            next(err);
        }
    },
    getShortDoctorById: async (req, res, next) => {
        const { doctorId } = req.params;

        try {
            const createdDoctor = await DoctorService.getShortDoctorById(doctorId);
            res.status(200).json(createdDoctor);
        } catch (err) {
            next(err);
        }
    },
    getDoctorsByClinicWithSorting: async (req, res, next) => {
        const { clinicId } = req.params;
        const { gender, sort } = req.query;

        try {
            const doctors = await DoctorService.getDoctorsByClinicWithSorting(clinicId, { gender, sort });
            res.status(200).json(doctors);
        } catch (err) {
            next(err);
        }
    },
}

module.exports = DoctorController;