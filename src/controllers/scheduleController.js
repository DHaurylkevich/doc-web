const ScheduleService = require("../services/scheduleService");
const AppError = require("../utils/appError");

const ScheduleController = {
    createSchedule: async (req, res, next) => {
        try {
            const { clinicId } = req.params;
            const scheduleData = req.body;

            if (req.user.id != clinicId) {
                throw new AppError("Clinic authorized error", 401);
            }

            const newSchedules = await ScheduleService.createSchedule(clinicId, scheduleData);

            return res.status(201).json(newSchedules);
        } catch (err) {
            next(err);
        }
    },
    getScheduleById: async (req, res, next) => {
        const { scheduleId } = req.params;

        try {
            const schedule = await ScheduleService.getScheduleById(scheduleId);

            return res.status(200).json(schedule);
        } catch (err) {
            next(err);
        }
    },
    updateSchedule: async (req, res, next) => {
        const { scheduleId } = req.params;
        const updateData = req.body;

        try {
            const updatedSchedule = await ScheduleService.updateSchedule(scheduleId, updateData);
            return res.status(200).json(updatedSchedule);
        } catch (err) {
            next(err);
        }
    },
    deleteSchedule: async (req, res, next) => {
        const { scheduleId } = req.params;

        try {
            await ScheduleService.deleteSchedule(scheduleId);
            res.status(200).json({ message: "Successful delete" });
        } catch (err) {
            next(err);
        }
    },
    getScheduleByDoctor: async (req, res, next) => {
        const { doctorId } = req.user.id;

        try {
            const schedules = await ScheduleService.getScheduleByDoctor(doctorId);
            return res.status(200).json(schedules);
        } catch (err) {
            next(err);
        }
    },
    getScheduleByClinic: async (req, res, next) => {
        const { clinicId } = req.params;

        try {
            const schedules = await ScheduleService.getScheduleByClinic(clinicId);
            return res.status(200).json(schedules);
        } catch (err) {
            next(err);
        }
    }
};

module.exports = ScheduleController;
