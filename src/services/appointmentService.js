const db = require("../models");
const AppError = require("../utils/appError");
const { getPaginationParams, getTotalPages } = require("../utils/pagination");
const { timeToMinutes, minutesToTime } = require("../utils/timeUtils");
const { checkScheduleAndSlot } = require("./scheduleService");
const { checkDoctorService } = require("./doctorServiceService");
const { Op } = require("sequelize");

const AppointmentService = {
    createAppointment: async ({ doctorId, serviceId, patientId, date, timeSlot, firstVisit, visitType, description }) => {
        const [schedule, doctorService] = await Promise.all([
            checkScheduleAndSlot(doctorId, date, timeSlot),
            checkDoctorService(doctorId, serviceId)
        ]);

        try {
            await db.Appointments.create({
                clinic_id: doctorService.service.clinic_id,
                schedule_id: schedule.id,
                patient_id: patientId,
                doctor_service_id: doctorService.id,
                time_slot: timeSlot,
                description: description,
                first_visit: firstVisit,
                visit_type: visitType,
                status: "active"
            });

            return;
        } catch (err) {
            throw err;
        }
    },
    getAppointmentsByPatientId: async (patientId, limit, page) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);

        try {
            const { rows, count } = await db.Appointments.findAndCountAll({
                limit: parsedLimit,
                offset: offset,
                where: { patient_id: patientId },
                attributes: [],
                order: [
                    [db.Schedules, "date", "ASC"],
                ],                
                include: [
                    {
                        model: db.DoctorService,
                        as: 'doctorService',
                        attributes: ["id"],
                        include: [
                            {
                                model: db.Doctors,
                                as: 'doctor',
                                attributes: ["id"],
                                include: [
                                    {
                                        model: db.Users,
                                        as: "user",
                                        attributes: ["first_name", "last_name"]
                                    },
                                    {
                                        model: db.Specialties,
                                        as: "specialty",
                                        attributes: ["name"],
                                    }
                                ]
                            },
                            {
                                model: db.Services,
                                as: "service",
                                attributes: ["name"],
                            },
                        ],
                    },
                    {
                        model: db.Schedules,
                        attributes: ["date"],
                    }
                ],
            });

            const totalPages = getTotalPages(count, parsedLimit, page);

            if (!rows.length) {
                return { pages: 0, appointments: [] };
            }

            const appointments = rows.map(appointment => {
                return {
                    doctor: appointment.doctorService.doctor.user,
                    specialty: appointment.doctorService.doctor.specialty.name,
                    service: appointment.doctorService.service.name,
                    date: appointment.Schedule.date,
                }
            });

            return { pages: totalPages, appointments };
        } catch (err) {
            throw err;
        }
    },
    //TODO: ВОЗМОЖНО УДАЛИТЬ, НИГДЕ НЕ ИСПОЛЬЗУЕТСЯ
    deleteAppointment: async (id) => {
        try {
            const appointment = await db.Appointments.findByPk(id);

            if (!appointment) {
                throw new AppError("Appointment not found", 404);
            }

            await appointment.destroy();
        } catch (err) {
            throw err;
        }
    },
    getAppointmentsByClinic: async ({ clinicId, doctorId, patientId, date, specialty, limit, page }) => {
        let appointmentWhere = { clinic_id: clinicId };
        if (patientId) {
            appointmentWhere.patient_id = patientId;
        }

        const doctorServiceWhere = doctorId ? { doctor_id: doctorId } : {};
        const specialtyWhere = specialty ? { name: specialty } : {};
        const scheduleWhere = date ? { date: date } : {};

        const { parsedLimit, offset } = getPaginationParams(limit, page);

        try {
            const { rows, count } = await db.Appointments.findAndCountAll({
                attributes: ["status", "time_slot", "doctor_service_id", "schedule_id", "patient_id"],
                limit: parsedLimit,
                offset: offset,
                where: appointmentWhere,
                order: [
                    [db.Schedules, "date", "ASC"],
                    ["time_slot", "ASC"]
                ],   
                include: [
                    {
                        model: db.DoctorService,
                        as: "doctorService",
                        where: doctorServiceWhere,
                        attributes: ["doctor_id", "service_id", "id"],
                        include: [
                            {
                                model: db.Doctors,
                                as: "doctor",
                                attributes: ["specialty_id", "user_id"],
                                include: [
                                    {
                                        model: db.Specialties,
                                        as: "specialty",
                                        attributes: ["name"],
                                        where: specialtyWhere
                                    },
                                    {
                                        model: db.Users,
                                        as: "user",
                                        attributes: ["first_name", "last_name", "photo"],
                                    },
                                ]
                            },
                            {
                                model: db.Services,
                                as: "service",
                                attributes: ["name", "price"]
                            }
                        ]
                    },
                    {
                        model: db.Patients,
                        as: "patient",
                        attributes: ["user_id"],
                        include: [
                            {
                                model: db.Users,
                                as: "user",
                                attributes: ["first_name", "last_name", "photo"],
                            },
                        ]
                    },
                    {
                        model: db.Schedules,
                        attributes: ["id", "date", "interval"],
                        // order: [["date", "DESC"]],
                        where: scheduleWhere,
                    },
                ]
            });

            const totalPages = getTotalPages(count, parsedLimit, page);

            const appointments = rows.map(appointment => {
                const end_time = timeToMinutes(appointment.time_slot.slice(0, -3))
                return {
                    doctor: appointment.doctorService.doctor.user,
                    patient: {
                        patientId: appointment.patient.id,
                        ...appointment.patient.user.dataValues
                    },
                    specialty: appointment.doctorService.doctor.specialty,
                    service: appointment.doctorService.service,
                    date: appointment.Schedule.date,
                    start_time: appointment.time_slot.slice(0, -3),
                    end_time: minutesToTime(end_time + appointment.Schedule.interval),
                }
            });

            return { pages: totalPages, appointments };
        } catch (err) {
            throw err;
        }
    },
    getAllAppointmentsByDoctor: async ({ doctorId, limit, page, startDate, endDate, status }) => {
        let scheduleWhere = {};

        if (startDate && endDate) {
            scheduleWhere.date = {
                [Op.between]: [startDate, endDate]
            };
        } else if (startDate) {
            scheduleWhere.date = {
                [Op.gte]: startDate
            };
        }

        const { parsedLimit, offset } = getPaginationParams(limit, page);

        try {
            const { rows, count } = await db.Appointments.findAndCountAll({
                limit: parsedLimit,
                offset: offset,
                where: status ? { status } : {},
                order: [
                    [db.Schedules, "date", "ASC"],
                    ["time_slot", "ASC"]
                ],
                attributes: { exclude: ["createdAt", "updatedAt", "doctor_service_id"] },
                include: [
                    {
                        model: db.DoctorService,
                        as: "doctorService",
                        where: { doctor_id: doctorId },
                        attributes: { exclude: ["id", "createdAt", "updatedAt"] },
                        include: [
                            {
                                model: db.Services, as: "service",
                                attributes: ["name", "price"]
                            }
                        ]
                    },
                    {
                        model: db.Schedules,
                        where: scheduleWhere,
                        attributes: ["date", "interval"],
                        order: [["date", "ASC"]]
                    },
                    {
                        model: db.Patients,
                        as: "patient",
                        attributes: ["user_id", "id"],
                        include: [
                            {
                                model: db.Users,
                                as: "user",
                                attributes: ["first_name", "last_name", "photo"],
                            }
                        ]
                    }
                ],
            });
            const totalPages = getTotalPages(count, parsedLimit, page);

            if (!rows.length) {
                return { pages: 0, appointments: [] };
            }

            const appointments = rows.map(appointment => {
                const end_time = timeToMinutes(appointment.time_slot.slice(0, -3))
                return {
                    date: appointment.Schedule.date,
                    start_time: appointment.time_slot.slice(0, -3),
                    end_time: minutesToTime(end_time + appointment.Schedule.interval),
                    description: appointment.description,
                    service: appointment.doctorService.service,
                    first_visit: appointment.first_visit,
                    visit_type: appointment.visit_type,
                    status: appointment.status,
                    patient: {
                        patientId: appointment.patient.id,
                        ...appointment.patient.user.dataValues
                    },
                }
            });

            return { pages: totalPages, appointments };
        } catch (err) {
            throw err;
        }
    },
    getAllAppointmentsByPatient: async ({ patientId, limit, page, startDate, endDate }) => {
        const scheduleWhere = startDate && endDate ? {
            date: {
                [Op.between]: [startDate, endDate]
            }
        } : {}

        const { parsedLimit, offset } = getPaginationParams(limit, page);

        try {
            const { rows, count } = await db.Appointments.findAndCountAll({
                where: { patient_id: patientId },
                limit: parsedLimit,
                offset: offset,
                attributes: { exclude: ["createdAt", "updatedAt", "doctor_service_id"] },
                order: [
                    [db.Schedules, "date", "ASC"],
                    ["time_slot", "ASC"]
                ],
                include: [
                    {
                        model: db.DoctorService, as: "doctorService",
                        attributes: { exclude: ["id", "createdAt", "updatedAt"] },
                        include: [
                            {
                                model: db.Doctors, as: "doctor",
                                attributes: ["user_id"],
                                include: [
                                    {
                                        model: db.Users,
                                        as: "user",
                                        attributes: ["first_name", "last_name", "photo"],
                                    }
                                ]
                            },
                            {
                                model: db.Services, as: "service",
                                attributes: ["name", "price"]
                            }
                        ]
                    },
                    {
                        model: db.Schedules,
                        where: scheduleWhere,
                        attributes: ["date", "interval"],
                        order: [["date", "DESC"]]
                    }
                ]
            });

            const totalPages = getTotalPages(count, parsedLimit, page);

            if (!rows.length) {
                return { pages: 0, appointments: [] };
            }

            const appointments = rows.map(appointment => {
                const end_time = timeToMinutes(appointment.time_slot.slice(0, -3))
                return {
                    date: appointment.Schedule.date,
                    start_time: appointment.time_slot.slice(0, -3),
                    end_time: minutesToTime(end_time + appointment.Schedule.interval),
                    description: appointment.description,
                    service: appointment.doctorService.service,
                    first_visit: appointment.first_visit,
                    visit_type: appointment.visit_type,
                    status: appointment.status,
                    doctor: appointment.doctorService.doctor.user,
                }
            });

            return { pages: totalPages, appointments };
        } catch (err) {
            throw err;
        }
    },
};

module.exports = AppointmentService;
