const { Op } = require("sequelize");
const db = require("../models");
const AppError = require("../utils/appError");

const ScheduleService = {
    createSchedule: async (clinicId, scheduleData) => {
        const t = await db.sequelize.transaction();

        try {
            const { doctorsIds, dates, ...commonData } = scheduleData;

            const existingDoctors = await db.Doctors.findAll({
                where: {
                    id: { [Op.in]: doctorsIds },
                    clinic_id: clinicId
                },
                attributes: ['id'],
                transaction: t
            });
            if (existingDoctors.length !== doctorsIds.length) {
                throw new AppError("One or more doctors not found", 404);
            }


            scheduleData = doctorsIds.flatMap(doctorId =>
                dates.map(date => ({
                    ...commonData,
                    date: date,
                    clinic_id: clinicId,
                    doctor_id: doctorId
                }))
            );
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
                include: [
                    {
                        model: db.Doctors,
                        as: "doctor"
                    },
                    {
                        model: db.Clinics,
                        as: "clinic"
                    }
                ]
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
                attributes: { exclude: ["createdAt", "updatedAt", "clinic_id"] },
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
                attributes: { exclude: ["createdAt", "updatedAt", "doctor_id"] },
                where: { clinic_id: clinicId },
                include: [
                    {
                        model: db.Doctors,
                        as: "doctor",
                        attributes: ["rating", "description"],
                        include: [
                            {
                                model: db.Users,
                                as: "user",
                                attributes: ["first_name", "last_name", "photo"]
                            }
                        ]
                    }
                ],
            });

            return schedule;
        } catch (err) {
            throw err;
        }
    },
}

module.exports = ScheduleService;