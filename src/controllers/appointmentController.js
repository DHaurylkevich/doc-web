const AppointmentService = require("../services/appointmentService");

const AppointmentController = {
    createAppointment: async (req, res, next) => {
        const { doctorId, doctorServiceId, clinicId, date, timeSlot, firstVisit, visitType, description } = req.body;
        const patientId = req.user.roleId;

        try {
            const appointment = await AppointmentService.createAppointment({ doctorId, doctorServiceId, clinicId, patientId, date, timeSlot, firstVisit, visitType, description });
            res.status(201).json(appointment);
        } catch (err) {
            next(err);
        }
    },
    getAvailableSlotsWithFilter: async (req, res, next) => {
        const { city, specialty, date, limit, page } = req.query;

        try {
            const availableSlot = await AppointmentService.getAvailableSlotsWithFilter({ city, specialty, date, limit, page });
            res.status(200).json(availableSlot);
        } catch (err) {
            next(err);
        }
    },
    getAppointmentsByClinic: async (req, res, next) => {
        const clinicId = req.user.id;
        const { doctorId, patientId, date, specialty, limit, page } = req.query;

        try {
            const appointments = await AppointmentService.getAppointmentsByClinic({ clinicId, doctorId, patientId, date, specialty, limit, page });
            res.status(200).json(appointments);
        } catch (err) {
            next(err);
        }
    },
    getAppointmentsByDoctor: async (req, res, next) => {
        const doctorId = req.user.roleId;
        const { startDate, endDate, status, limit, page } = req.query;

        try {
            const appointments = await AppointmentService.getAllAppointmentsByDoctor({ doctorId, limit, page, startDate, endDate, status });
            res.status(200).json(appointments);
        } catch (err) {
            next(err);
        }
    },
    getAppointmentsByPatient: async (req, res, next) => {
        const patientId = req.user.roleId;
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