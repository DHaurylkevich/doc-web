const db = require("../models");
const AppError = require("../utils/appError");
const ClinicService = require("../services/clinicService");
const UserService = require("../services/userService");
const { Op } = require("sequelize");

const AppointmentService = {
    createAppointment: async ({ doctorId, doctorServiceId, clinicId, userId, date, timeSlot, firstVisit, visitType, status, description }) => {
        const schedule = await db.Schedules.findOne({
            where: { doctor_id: doctorId, date: date },
            attributes: ["id", "date", "interval", "doctor_id", "start_time", "end_time"],
            include: [
                {
                    model: db.Appointments,
                    attributes: ["time_slot"]
                }
            ]
        })
        if (!schedule) {
            throw new AppError("This Schedule doesn't exist", 404);
        }

        AppointmentService.checkTimeSlot(schedule, timeSlot);

        const doctorService = await db.DoctorService.findByPk(doctorServiceId, {
            include: [{ model: db.Services, as: "service", attributes: ["clinic_id"] }]
        });
        if (!doctorService || doctorService.doctor_id !== doctorId || doctorService.service.clinic_id !== clinicId) {
            throw new AppError("This doctor service doesn't exist", 404);
        }

        await ClinicService.getClinicById(clinicId);

        const user = await UserService.getUserById(userId);
        const patient = await user.getPatient();
        if (!patient) {
            throw new AppError("Patient not found", 404);
        }

        try {
            const newAppointment = await db.Appointments.create({
                clinic_id: clinicId,
                schedule_id: schedule.id,
                patient_id: patient.id,
                doctor_service_id: doctorServiceId,
                time_slot: timeSlot,
                description: description,
                first_visit: firstVisit,
                visit_type: visitType,
                status: status
            });
            return {
                time_slot: newAppointment.time_slot,
                description: newAppointment.description,
                first_visit: newAppointment.first_visit,
                visit_type: newAppointment.visit_type,
                status: newAppointment.status,
            };
        } catch (err) {
            throw err;
        }
    },
    getAppointmentById: async (id) => {
        try {
            const appointment = await db.Appointments.findByPk(id, {
                include: [db.Doctors, db.Clinics, db.Patients, db.Schedules]
            });

            if (!appointment) {
                throw new AppError("Appointment not found", 404);
            }

            return appointment;
        } catch (err) {
            throw err;
        }
    },
    getAvailableSlotsWithFilter: async ({ city, specialty, date, limit, page }) => {
        const clinicWhere = city ? { city: city } : {};
        const specialtyWhere = specialty ? { name: specialty } : {};
        const scheduleWhere = date ? { date: date } : {};

        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;

        try {
            const { rows, count } = await db.Appointments.findAndCountAll({
                limit: parsedLimit,
                offset: offset,
                attributes: ["time_slot"],
                include: [
                    {
                        model: db.Schedules,
                        attributes: ["id", "date", "interval", "end_time", "start_time"],
                        where: scheduleWhere,
                        include: [
                            {
                                model: db.Doctors,
                                as: "doctor",
                                attributes: ["id", "description", "rating"],
                                include: [
                                    {
                                        model: db.Specialties,
                                        as: "specialty",
                                        attributes: ["name"],
                                        where: specialtyWhere
                                    }
                                ]
                            },
                            {
                                model: db.Clinics,
                                as: "clinic",
                                attributes: ["id", "name", "photo"],
                                include: [
                                    {
                                        model: db.Addresses,
                                        where: clinicWhere,
                                        as: "address",
                                        attributes: ["id", "city", "street", "home", "flat", "post_index"],
                                    }
                                ]
                            },
                        ]
                    },
                    {
                        model: db.DoctorService,
                        as: "doctorService",
                        attributes: ["id"],
                        include: [
                            {
                                model: db.Services,
                                as: "service",
                                attributes: ["id", "name", "price"]
                            }
                        ]
                    }
                ]
            });

            const totalPages = Math.ceil(count / parsedLimit);
            if (page - 1 > totalPages) {
                throw new AppError("Page not found", 404);
            }

            if (!rows.length) {
                return [];
            }
            // return rows;
            const availableSlots = rows.map(appointment => {
                const schedule = appointment.Schedule;
                const doctor = schedule.doctor;
                const slots = AppointmentService.getAvailableSlots(schedule);
                const freeSlots = slots.filter(slot => slot !== appointment.time_slot.slice(0, -3));

                return {
                    doctor_id: doctor.id,
                    description: doctor.description,
                    rating: doctor.rating,
                    specialty: doctor.specialty.name,
                    address: schedule.clinic.address || null,
                    date: schedule.date,
                    service: appointment.doctorService.service,
                    slots: freeSlots,
                };
            });

            availableSlots.push({ pages: totalPages });

            return availableSlots;
        } catch (err) {
            throw err;
        }
    },
    getAppointmentsWithFilter: async ({ clinicId, doctorId, patientId, date, limit, page }) => {
        let appointmentWhere = { clinic_id: clinicId };
        if (patientId) {
            appointmentWhere.patient_id = patientId;
        }

        const doctorServiceWhere = doctorId ? { doctor_id: doctorId } : {};
        const specialtyWhere = specialty ? { name: specialty } : {};
        const scheduleWhere = date ? { date: date } : {};

        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;

        try {
            const { rows, count } = await db.Appointments.findAndCountAll({
                attributes: ["status", "time_slot", "doctor_service_id", "schedule_id", "patient_id"],
                limit: parsedLimit,
                offset: offset,
                where: appointmentWhere,
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
                        as: "schedule",
                        attributes: ["id", "date", "interval"],
                        order: [['date', 'DESC']],
                        where: scheduleWhere,
                    },
                ]
            });

            const totalPages = Math.ceil(count / parsedLimit);
            if (page - 1 > totalPages) {
                throw new AppError("Page not found", 404);
            }

            if (!rows.length) {
                return [];
            }

            const availableSlots = rows.map(appointment => {
                const end_time = AppointmentService.timeToMinutes(appointment.time_slot.slice(0, -3))
                return {
                    doctor: appointment.doctorService.doctor.user,
                    patient: {
                        patientId: appointment.patient.id,
                        ...appointment.patient.user
                    },
                    specialty: appointment.doctorService.doctor.specialty,
                    service: appointment.doctorService.service,
                    date: appointment.Schedule.date,
                    start_time: appointment.time_slot.slice(0, -3),
                    end_time: AppointmentService.minutesToTime(end_time + appointment.Schedule.interval),
                }
            });

            availableSlots.push({ pages: totalPages });

            return availableSlots;
        } catch (err) {
            throw err;
        }
    },
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
    getAllAppointmentsByDoctor: async ({ doctorId, limit, page, startDate, endDate, status }) => {
        const scheduleWhere = startDate && endDate ? {
            date: {
                [Op.between]: [startDate, endDate]
            }
        } : {}

        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;

        try {
            const { rows, count } = await db.Appointments.findAndCountAll({
                limit: parsedLimit,
                offset: offset,
                where: status ? { status } : {},
                order: [
                    [db.Schedules, 'date', 'ASC'],
                    ['time_slot', 'ASC']
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
                        order: [['date', 'ASC']]
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
                            }
                        ]
                    }
                ],
            });
            const totalPages = Math.ceil(count / parsedLimit);
            if (page - 1 > totalPages) {
                throw new AppError("Page not found", 404);
            }

            if (!rows.length) {
                return [];
            }

            // return rows.flatMap(appointment => {
            let availableSlots = rows.map(appointment => {
                const end_time = AppointmentService.timeToMinutes(appointment.time_slot.slice(0, -3))
                return {
                    date: appointment.Schedule.date,
                    start_time: appointment.time_slot.slice(0, -3),
                    end_time: AppointmentService.minutesToTime(end_time + appointment.Schedule.interval),
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

            availableSlots.push({ pages: totalPages });

            return availableSlots;
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

        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;

        try {
            const { rows, count } = await db.Appointments.findAndCountAll({
                where: { patient_id: patientId },
                limit: parsedLimit,
                offset: offset,
                attributes: { exclude: ["createdAt", "updatedAt", "doctor_service_id"] },
                order: [
                    [db.Schedules, 'date', 'ASC'],
                    ['time_slot', 'ASC']
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
                        order: [['date', 'DESC']]
                    }
                ]
            });

            const totalPages = Math.ceil(count / parsedLimit);
            if (page - 1 > totalPages) {
                throw new AppError("Page not found", 404);
            }

            if (!rows.length) {
                return [];
            }

            const availableSlots = rows.map(appointment => {
                const end_time = AppointmentService.timeToMinutes(appointment.time_slot.slice(0, -3))
                return {
                    date: appointment.Schedule.date,
                    start_time: appointment.time_slot.slice(0, -3),
                    end_time: AppointmentService.minutesToTime(end_time + appointment.Schedule.interval),
                    description: appointment.description,
                    service: appointment.doctorService.service,
                    first_visit: appointment.first_visit,
                    visit_type: appointment.visit_type,
                    status: appointment.status,
                    doctor: appointment.doctorService.doctor.user,
                }
            });

            availableSlots.push({ pages: totalPages });

            return availableSlots;
        } catch (err) {
            throw err;
        }
    },
    /**
     * Проверка существует ли слот в графике и не занят ли слот 
     * @param {*} schedule 
     * @returns 
     */
    checkTimeSlot: (schedule, timeSlot) => {
        const slots = AppointmentService.getAvailableSlots(schedule);
        const isTimeSlotAvailable = slots.includes(timeSlot);
        if (!isTimeSlotAvailable) {
            throw new AppError("This time slot is not available", 400);
        }

        const occupiedSlots = schedule.Appointments.map(app => app.time_slot.slice(0, -3));
        const slot = occupiedSlots.includes(timeSlot);
        if (slot) {
            throw new AppError("This time slot is not free", 400);
        }
    },
    /**
     * Получение всех слотов
     * @param {*} schedule 
     * @returns 
     */
    getAvailableSlots: (schedule) => {
        const { start_time, end_time, interval } = schedule;

        const start = AppointmentService.timeToMinutes(start_time.slice(0, -3));
        const end = AppointmentService.timeToMinutes(end_time.slice(0, -3));
        const slots = [];

        for (let time = start; time < end; time += interval) {
            slots.push(AppointmentService.minutesToTime(time));
        }

        return slots;
    },
    /**
     * Вспомогательная функция для преобразования времени в минуты
     * @param {*} time 
     * @returns 
     */
    timeToMinutes: (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    },
    /**
     * Вспомогательная функция для преобразования минут в формат HH:MM
     * @param {*} minutes 
     * @returns 
     */
    minutesToTime: (minutes) => {
        const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
        const mins = (minutes % 60).toString().padStart(2, '0');
        return `${hours}:${mins}`;
    },
};

module.exports = AppointmentService;
