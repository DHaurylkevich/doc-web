const AppointmentService = require("../services/appointmentService");

const AppointmentController = {
    createAppointment: async (req, res, next) => {
        const { doctorId, doctorServiceId, clinicId, userId, date, timeSlot, firstVisit, visitType, status, description } = req.body;

        try {
            const specialty = await AppointmentService.createAppointment(doctorId, doctorServiceId, clinicId, userId, date, timeSlot, firstVisit, visitType, status, description);
            res.status(201).json(specialty);
        } catch (err) {
            console.log(err);
            next(err);
        }
    },
    getSpecialty: async (req, res, next) => {
        const { id } = req.params;

        try {
            const specialty = await SpecialtyService.getSpecialtyById(id);
            res.status(200).json(specialty);
        } catch (err) {
            next(err);
        }
    },
    getAvailableSlotsWithFilter: async (req, res, next) => {
        const { city, specialty, date, visitType, limit = 10, page = 1 } = req.query;

        try {
            const specialties = await AppointmentService.getAvailableSlotsWithFilter({ city, specialty, date, visitType, limit: parseInt(limit), page: parseInt(page) });
            res.status(200).json(specialties);
        } catch (err) {
            console.log(err)
            next(err);
        }
    },
    getAllAppointmentsByDoctor: async (req, res, next) => {
        const { doctorId } = req.params;
        const { limit = 10, offset = 0 } = req.query;
        try {
            const appointments = await AppointmentService.getAllAppointmentsByDoctor(doctorId, parseInt(limit), parseInt(offset));
            res.status(200).json(appointments);
        } catch (err) {
            console.log(err)
            next(err);
        }
    },
    getAllAppointmentsByPatient: async (req, res, next) => {
        const { patientId } = req.params;
        const { limit = 10, offset = 0 } = req.query;

        try {
            const appointments = await AppointmentService.getAllAppointmentsByPatient(patientId, parseInt(limit), parseInt(offset));
            res.status(200).json(appointments);
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
    deleteAppointment: async (req, res, next) => {
        const { id } = req.params;

        try {
            await AppointmentService.deleteAppointment(id);
            res.status(200).json({ message: "Successful delete" });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = AppointmentController;