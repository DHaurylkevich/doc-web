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
        const { userData, doctorData, specialtyId, clinicId, servicesIds } = req.body;

        try {
            const createdDoctor = await DoctorService.createDoctor(userData, doctorData, specialtyId, clinicId, servicesIds);
            res.status(201).json(createdDoctor);
        } catch (err) {
            console.log(err);
            next(err);
        }
    },
    getDoctorById: async (req, res, next) => {
        const doctorId = req.params.id;

        try {
            const createdDoctor = await DoctorService.getDoctorById(doctorId);
            res.status(200).json(createdDoctor);
        } catch (err) {
            console.log(err);
            next(err);
        }
    },
    updateDoctorById: async (req, res, next) => {
        const doctorId = req.params.id;
        const { userData, doctorData, servicesIds } = req.body;

        try {
            const updateDoctor = await DoctorService.updateDoctorById(doctorId, userData, doctorData, servicesIds);
            res.status(200).json(updateDoctor);
        } catch (err) {
            console.log(err);
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
        const doctorId = req.params.id;

        try {
            const createdDoctor = await DoctorService.getShortDoctorById(doctorId);
            res.status(200).json(createdDoctor);
        } catch (err) {
            console.log(err);
            next(err);
        }
    },
    getDoctorsByClinicWithSorting: async (req, res) => {
        const { clinicId } = req.params;
        const { gender, order } = req.query;

        // Проверка существования клиники(Отдельный сервис)

        try {
            const doctors = await DoctorService.getDoctorsByClinicWithSorting(clinicId, { gender, order });
            res.status(200).json(doctors);
        } catch (err) {
            console.log(err);
            next(err);
        }
    },
}

module.exports = DoctorController;