const { Op } = require("sequelize");
const db = require("../models");
const AppError = require("../utils/appError");

const ScheduleService = {
    createSchedule: async (clinicId, scheduleData) => {
        const t = await db.sequelize.transaction();

        try {
            const { doctorsIds, ...commonData } = scheduleData;

            const existingDoctors = await db.Doctors.findAll({
                where: { id: { [Op.in]: doctorsIds } },
                attributes: ['id'],
                transaction: t
            });
            if (existingDoctors.length !== doctorsIds.length) {
                throw new AppError("One or more doctors not found", 404);
            }

            const existingClinic = await db.Clinics.findByPk(clinicId, {
                attributes: ['id'],
                transaction: t
            });
            if (!existingClinic) {
                throw new AppError("Clinic not found", 404);
            }

            scheduleData = doctorsIds.map(doctorId => ({
                ...commonData,
                clinic_id: clinicId,
                doctor_id: doctorId
            }));
            const existingSchedules = await db.Schedules.findAll({
                where: {
                    [Op.or]: scheduleData
                },
                transaction: t
            });
            if (existingSchedules.length > 0) {
                throw new AppError("One or more schedules already exist", 400);
            }

            const createdSchedules = await db.Schedules.bulkCreate(scheduleData, { transaction: t });

            await t.commit();
            return createdSchedules;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getScheduleById: async (id) => {
        try {
            const schedule = await db.Schedules.findByPk(id, {
                include: [db.Doctors, db.Clinics]
            });

            if (!schedule) {
                throw new AppError("Schedule not found", 404);
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
                throw new AppError("Schedule not found", 404);
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
                throw new AppError("Schedule not found", 404);
            }

            await schedule.destroy();
        } catch (err) {
            throw err;
        }
    },
    getScheduleByDoctor: async (doctorId) => {
        try {
            const schedule = await db.Schedules.findAll({
                where: { doctor_id: doctorId },
            });

            return schedule;
        } catch (err) {
            throw err;
        }
    },
    getScheduleByClinic: async (clinicId) => {
        try {
            const schedule = await db.Schedules.findAll({
                where: { clinic_id: clinicId },
                include: [db.Doctors],
            });

            return schedule;
        } catch (err) {
            throw err;
        }
    },
}

module.exports = ScheduleService;