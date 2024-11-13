// const TEST = require("../../tests/unit/controllers/patientController.test.js");
const DoctorService = require("../services/doctorService");

const DoctorController = {
    /**
     * Вход пользователя
     * @param {Object} userData 
     * @param {Object} patientData
     * @param {Object} specialty_id
     * @param {Number} clinic_id
     * @param {*} next 
     */
    createDoctor: async (req, res, next) => {
        const { clinicId } = req.params;
        const { userData, addressData, doctorData, specialtyId, servicesIds } = req.body;

        try {
            const createdDoctor = await DoctorService.createDoctor(userData, addressData, doctorData, specialtyId, clinicId, servicesIds);
            res.status(201).json(createdDoctor);
        } catch (err) {
            console.log(err);
            next(err);
        }
    },
    getDoctorById: async (req, res, next) => {
        const { userId } = req.params;

        try {
            const createdDoctor = await DoctorService.getDoctorById(userId);
            res.status(200).json(createdDoctor);
        } catch (err) {
            next(err);
        }
    },
    updateDoctorById: async (req, res, next) => {
        const { userId } = req.params;
        const { userData, addressData, doctorData, servicesIds } = req.body;

        try {
            const updateDoctor = await DoctorService.updateDoctorById(userId, userData, addressData, doctorData, servicesIds);
            res.status(200).json(updateDoctor);
        } catch (err) {
            next(err);
        }
    },
    // addServiceToDoctor: async (req, res, next) => {
    //     const doctorId = req.params.id;
    //     const { data } = req.body; // data: [{ specialtyId, services: [{ serviceId, price }] }]

    //     try {
    //         await DoctorService.addServiceToDoctor(doctorId, data);
    // res.status(200).json({ message: "Successfully added services to doctor" });
    //     } catch (err) {
    //         next(err);
    //     }
    // },
    getShortDoctorById: async (req, res, next) => {
        const { doctorId } = req.params;

        try {
            const createdDoctor = await DoctorService.getShortDoctorById(doctorId);
            res.status(200).json(createdDoctor);
        } catch (err) {
            next(err);
        }
    },
    getDoctorsByClinicWithSorting: async (req, res) => {
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