const ScheduleService = require("../services/scheduleService");

const ScheduleController = {
    createSchedule: async (req, res, next) => {
        try {
            const { clinicId } = req.params;
            const scheduleData = req.body;

            const newSchedules = await ScheduleService.createSchedule(clinicId, scheduleData);
            return res.status(201).json(newSchedules);
        } catch (err) {
            next(err);
        }
    },
    getScheduleById: async (req, res) => {
        const { scheduleId } = req.params;

        try {
            const schedule = await ScheduleService.getScheduleById(scheduleId);
            return res.status(200).json(schedule);
        } catch (err) {
            next(err);
        }
    },
    updateSchedule: async (req, res) => {
        const { scheduleId } = req.params;

        try {
            const updateData = req.body;
            const updatedSchedule = await ScheduleService.updateSchedule(scheduleId, updateData);
            return res.status(200).json(updatedSchedule);
        } catch (err) {
            next(err);
        }
    },
    deleteSchedule: async (req, res) => {
        const { scheduleId } = req.params;

        try {
            const result = await ScheduleService.deleteSchedule(scheduleId);
            return res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },
    getScheduleByDoctor: async (req, res) => {
        const { doctorId } = req.params;

        try {
            const schedules = await ScheduleService.getScheduleByDoctor(doctorId);
            return res.status(200).json(schedules);
        } catch (err) {
            next(err);
        }
    },
    getScheduleByClinic: async (req, res) => {
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
