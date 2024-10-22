// const TEST = require("../../tests/unit/services/doctorService.test");
const db = require("../models");
const DoctorService = require("../services/doctorService");
const ClinicService = require("../services/clinicService");

const ScheduleService = {
    createSchedule: async (scheduleData) => {
        const { doctor_id, clinic_id, date, start_time, end_time } = scheduleData;

        await DoctorService.getDoctorById(doctor_id);
        await ClinicService.getClinicById(clinic_id);

        const schedule = await db.Schedules.findOne({
            where: { date: date, clinic_id: clinic_id, doctor_id: doctor_id },
        });
        if (schedule) {
            throw new Error("Schedule is exist");
        }

        try {
            const newSchedule = await db.Schedules.create({
                doctor_id,
                clinic_id,
                date,
                start_time,
                end_time
            });
            return newSchedule;
        } catch (err) {
            throw err;
        }
    },
    getScheduleById: async (id) => {
        try {
            const schedule = await db.Schedules.findByPk(id, {
                include: [db.Doctors, db.Clinics]
            });

            if (!schedule) {
                throw new Error("Schedule not found");
            }

            return schedule;
        } catch (err) {
            throw err;
        }
    },
    updateSchedule: async (id, data) => {
        try {
            let schedule = await db.Schedules.findByPk(id);

            if (!schedule) {
                throw new Error("Schedule not found");
            }

            schedule = await schedule.update(data);

            return schedule;
        } catch (err) {
            throw err;
        }
    },
    deleteSchedule: async (id) => {
        try {
            let schedule = await db.Schedules.findByPk(id);

            if (!schedule) {
                throw new Error("Schedule not found");
            }

            await schedule.destroy();
        } catch (err) {
            throw err;
        }
    },
    getScheduleByDoctor: async (doctor_id) => {
        try {
            const schedule = await db.Schedules.findAll({
                where: { doctor_id: doctor_id },
            });

            return schedule;
        } catch (err) {
            throw err;
        }
    },
    getScheduleByClinic: async (clinic_id) => {
        try {
            const schedule = await db.Schedules.findAll({
                where: { clinic_id: clinic_id },
                include: [db.Doctors],
            });

            return schedule;
        } catch (err) {
            throw err;
        }
    },
}

module.exports = ScheduleService;