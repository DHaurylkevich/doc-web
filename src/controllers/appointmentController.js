const AppointmentService = require("../services/appointmentService");
const AppError = require("../utils/appError");

const AppointmentController = {
    createAppointment: async (req, res, next) => {
        const { doctorId, doctorServiceId, clinicId, date, timeSlot, firstVisit, visitType, status, description } = req.body;
        const userId = req.user.id;

        if (req.user.role !== "patient") {
            throw new AppError("User is not a patient", 400);

        }
        try {
            const appointment = await AppointmentService.createAppointment({ doctorId, doctorServiceId, clinicId, userId, date, timeSlot, firstVisit, visitType, status, description });
            res.status(201).json(appointment);
        } catch (err) {
            next(err);
        }
    },
    getAvailableSlotsWithFilter: async (req, res, next) => {
        const { city, specialty, date, visitType, limit, page } = req.query;

        try {
            const availableSlot = await AppointmentService.getAvailableSlotsWithFilter({ city, specialty, date, limit, page });
            res.status(200).json(availableSlot);
        } catch (err) {
            next(err);
        }
    },
    getAppointmentsWithFilter: async (req, res, next) => {
        const { clinicId } = req.params;
        const { doctorId, patientId, date, limit, page } = req.query;

        try {
            const appointments = await AppointmentService.getAppointmentsWithFilter({ clinicId, doctorId, patientId, date, limit, page });
            res.status(200).json(appointments);
        } catch (err) {
            next(err);
        }
    },
    getAppointmentsByDoctor: async (req, res, next) => {
        const { doctorId } = req.params;
        const { limit, page, startDate, endDate, status } = req.query;
        try {
            const appointments = await AppointmentService.getAllAppointmentsByDoctor({ doctorId, limit, page, startDate, endDate, status });
            res.status(200).json(appointments);
        } catch (err) {
            next(err);
        }
    },
    getAppointmentsByPatient: async (req, res, next) => {
        const { patientId } = req.params;
        const { limit, page, startDate, endDate } = req.query;

        try {
            const appointments = await AppointmentService.getAllAppointmentsByPatient({ patientId, limit, page, startDate, endDate });
            res.status(200).json(appointments);
        } catch (err) {
            console.log(err)
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