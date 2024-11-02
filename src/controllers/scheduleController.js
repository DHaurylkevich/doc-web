const ScheduleService = require("../services/scheduleService");

const ScheduleController = {
    createSchedule: async (req, res) => {
        try {
            const { scheduleData } = req.body;

            const newSchedules = await ScheduleService.createSchedule(scheduleData);
            return res.status(201).json(newSchedules);
        } catch (error) {
            console.error("Error in createSchedule controller:", error);
            return res.status(400).json({ message: error.message });
        }
    },

    getScheduleById: async (req, res) => {
        try {
            const { id } = req.params;
            const schedule = await ScheduleService.getScheduleById(id);
            return res.status(200).json(schedule);
        } catch (error) {
            console.error("Error in getScheduleById controller:", error);
            return res.status(404).json({ message: error.message });
        }
    },

    updateSchedule: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedSchedule = await ScheduleService.updateSchedule(id, updateData);
            return res.status(200).json(updatedSchedule);
        } catch (error) {
            console.error("Error in updateSchedule controller:", error);
            return res.status(400).json({ message: error.message });
        }
    },

    deleteSchedule: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await ScheduleService.deleteSchedule(id);
            return res.status(200).json(result);
        } catch (error) {
            console.error("Error in deleteSchedule controller:", error);
            return res.status(400).json({ message: error.message });
        }
    },

    getScheduleByDoctor: async (req, res) => {
        try {
            const { doctor_id } = req.params;
            const schedules = await ScheduleService.getScheduleByDoctor(doctor_id);
            return res.status(200).json(schedules);
        } catch (error) {
            console.error("Error in getScheduleByDoctor controller:", error);
            return res.status(400).json({ message: error.message });
        }
    },

    getScheduleByClinic: async (req, res) => {
        try {
            const { clinic_id } = req.params;
            const schedules = await ScheduleService.getScheduleByClinic(clinic_id);
            return res.status(200).json(schedules);
        } catch (error) {
            console.error("Error in getScheduleByClinic controller:", error);
            return res.status(400).json({ message: error.message });
        }
    }
};

module.exports = ScheduleController;
