const { Op } = require("sequelize");
const db = require("../models");
const AppError = require("../utils/appError");
const { getPaginationParams, getTotalPages } = require("../utils/pagination");


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
                attributes: ["id"],
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
    getScheduleByDoctor: async (doctorId, limit, page) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);

        try {
            const { rows, count } = await db.Schedules.findAndCountAll({
                limit: parsedLimit,
                offset: offset,
                attributes: { exclude: ["createdAt", "updatedAt", "clinic_id", "available_slots"] },
                where: { doctor_id: doctorId }
            });

            const totalPages = getTotalPages(count, parsedLimit, page);

            return { pages: totalPages, schedule: rows };
        } catch (err) {
            throw err;
        }
    },
    getScheduleByClinic: async (clinicId, limit, page) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);

        try {
            const { rows, count } = await db.Schedules.findAndCountAll({
                limit: parsedLimit,
                offset: offset,
                attributes: { exclude: ["createdAt", "updatedAt", "doctor_id", "available_slots"] },
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

            const totalPages = getTotalPages(count, parsedLimit, page);

            return { pages: totalPages, schedule: rows };
        } catch (err) {
            throw err;
        }
    },
    getAvailableSlotsWithFilter: async ({ city, specialty, date, limit, page }) => {
        const clinicWhere = city ? { city: city } : {};
        const specialtyWhere = specialty ? { name: specialty } : {};
        const scheduleWhere = date
            ? { where: { date: date } }
            : {
                limit: 2,
                where: {
                    date: {
                        [Op.gte]: new Date()
                    },
                    available_slots: { [Op.not]: [] }
                },
                required: false,
            };

        const { parsedLimit, offset } = getPaginationParams(limit, page);

        try {
            const { rows, count } = await db.Doctors.findAndCountAll({
                limit: parsedLimit,
                offset: offset,
                attributes: ["id", "description", "rating"],
                distinct: true,
                include: [
                    {
                        model: db.Schedules,
                        attributes: ["id", "date", "interval", "end_time", "start_time", "available_slots"],
                        ...scheduleWhere,
                        order: [["date", "ASC"]],
                        include: [{ model: db.Appointments, as: "appointments", attributes: ["time_slot"] }],
                    },
                    {
                        model: db.Users,
                        as: "user",
                        attributes: ["first_name", "last_name", "photo"],
                    },
                    {
                        model: db.Specialties,
                        as: "specialty",
                        attributes: ["name"],
                        where: specialtyWhere,
                        required: true,
                    },
                    {
                        model: db.Clinics,
                        as: "clinic",
                        attributes: ["id", "name"],
                        required: true,
                        include: [
                            {
                                model: db.Addresses,
                                as: "address",
                                where: clinicWhere,
                                attributes: ["id", "city", "street", "home", "flat", "post_index"],
                                required: true,
                            }
                        ]
                    },
                    {
                        model: db.Services,
                        as: "services",
                        attributes: ["id", "name", "price"],
                        through: { attributes: [] },
                    }
                ]
            });

            const totalPages = getTotalPages(count, parsedLimit, page);

            // return rows
            const availableSlots = rows.map(doctor => {
                const freeSlots = doctor.Schedules.map(schedule => {
                    return { date: schedule.date, slots: schedule.available_slots };
                });

                return {
                    doctor_id: doctor.id,
                    description: doctor.description,
                    rating: doctor.rating,
                    user: doctor.user,
                    specialty: doctor.specialty.name,
                    clinic: doctor.clinic.name,
                    address: doctor.clinic.address,
                    service: doctor.services,
                    available_slots: freeSlots,
                };
            });

            return { totalCount: count, pages: totalPages, slots: availableSlots };
        } catch (err) {
            throw err;
        }
    },
    checkScheduleAndSlot: async (doctorId, date, timeSlot) => {
        const schedule = await db.Schedules.findOne({
            where: { doctor_id: doctorId, date: date },
            attributes: ["id", "available_slots"],
            include: [
                {
                    model: db.Appointments,
                    as: "appointments",
                    attributes: ["time_slot"],
                },
            ],
        });

        if (!schedule) {
            throw new AppError("Расписание врача на указанную дату не найдено.", 404);
        }

        if (!schedule.available_slots.includes(timeSlot)) {
            throw new AppError(`Временной слот ${timeSlot} недоступен.`, 400);
        }

        return schedule;
    },
}

module.exports = ScheduleService;