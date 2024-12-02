const db = require("../models");
const AppError = require("../utils/appError");
const ClinicService = require("../services/clinicService");
const UserService = require("../services/userService");
const DoctorService = require("../services/doctorService");

const AppointmentService = {
    createAppointment: async (doctorId, doctorServiceId, clinicId, userId, date, timeSlot, firstVisit, visitType, status, description) => {
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
            throw new AppError("This doctor service not exist", 404);
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
            return newAppointment;
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
    getAvailableSlotsWithFilter: async (filters) => {
        const clinicWhere = filters.city ? { city: filters.city } : {};
        const specialtyWhere = filters.specialty ? { name: filters.specialty } : {};
        const scheduleWhere = filters.date ? { date: filters.date } : {};

        try {
            const offset = (filters.page - 1) * filters.limit;
            const doctors = await db.Doctors.findAll({
                attributes: ["id", "description", "rating"],
                limit: filters.limit,
                offset: offset >= 0 ? offset : 0,
                include: [
                    {
                        model: db.Clinics,
                        include: [
                            {
                                model: db.Addresses,
                                where: clinicWhere,
                                as: "address",
                                attributes: ["city", "street", "home", "flat", "post_index"],
                            }
                        ]
                    },
                    {
                        model: db.Specialties,
                        as: "specialty",
                        attributes: ["name"],
                        where: specialtyWhere
                    },
                    {
                        model: db.Schedules,
                        attributes: ["id", "date", "interval", "end_time", "start_time"],
                        order: [['date', 'DESC']],
                        where: scheduleWhere,
                        include: [
                            {
                                model: db.Appointments,
                                attributes: ["time_slot"]
                            }
                        ]
                    },
                ]
            });
            if (!doctors.length) {
                return [];
            }
            // return doctors;

            return doctors.map(doctor => {
                const availableSlots = doctor.Schedules.map(schedule => {
                    const occupiedSlots = schedule.Appointments.map(app => app.timeSlot.slice(0, -3));
                    const slots = AppointmentService.getAvailableSlots(schedule);
                    const freeSlots = slots.filter(slot => !occupiedSlots.includes(slot));
                    return {
                        doctor_id: doctor.id,
                        description: doctor.description,
                        rating: doctor.rating,
                        specialty: doctor.specialty.name,
                        address: doctor.Clinic.address,
                        date: schedule.date,
                        slots: freeSlots
                    };
                });
                return availableSlots;
            }).flat();
        } catch (err) {
            throw err;
        }
    },
    getAppointmentsWithFilter: async (clinicId, filters) => {
        let appointmentWhere = { clinic_id: clinicId };
        if (filters.patientId) {
            appointmentWhere.patient_id = filters.patientId;
        }
        const doctorServiceWhere = filters.doctorId ? { doctor_id: filters.doctorId } : {};
        const specialtyWhere = filters.specialty ? { name: filters.specialty } : {};
        const scheduleWhere = filters.date ? { date: filters.date } : {};

        try {
            const offset = (filters.page - 1) * filters.limit;
            const appointments = await db.Appointments.findAll({
                attributes: ["status", "time_slot", "doctor_service_id", "schedule_id", "patient_id"],
                limit: filters.limit,
                offset: offset >= 0 ? offset : 0,
                where: appointmentWhere,
                include: [
                    {
                        model: db.DoctorService,
                        as: "doctorService",
                        where: doctorServiceWhere,
                        attributes: ["doctor_id", "service_id"],
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
                        order: [['date', 'DESC']],
                        where: scheduleWhere,
                    },
                ]
            });
            if (!appointments.length) {
                return [];
            }

            return appointments.map(appointment => {
                const end_time = AppointmentService.timeToMinutes(appointment.time_slot.slice(0, -3))
                return {
                    doctor: appointment.doctorService.doctor.user,
                    patient: appointment.Patient.user,
                    specialty: appointment.doctorService.doctor.specialty,
                    service: appointment.doctorService.service,
                    date: appointment.Schedule.date,
                    start_time: appointment.time_slot.slice(0, -3),
                    end_time: AppointmentService.minutesToTime(end_time + appointment.Schedule.interval),
                }
            }).flat();
        } catch (err) {
            throw err;
        }
    },
    updateAppointment: async (id, data) => {
        try {
            let appointment = await db.Appointments.findByPk(id);

            if (!appointment) {
                throw new AppError("Appointment not found", 404);
            }

            appointment = await appointment.update(data);

            return appointment;
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
    getAllAppointmentsByDoctor: async ({ doctorId, limit, offset, startDate, endDate }) => {
        try {
            const offsetValue = offset * limit;
            const appointments = await db.Appointments.findAll({
                limit: limit,
                offset: offsetValue >= 0 ? offsetValue : 0,
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
                        where: {
                            date: {
                                [db.Sequelize.Op.between]: [startDate, endDate]
                            }
                        },
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
            if (!appointments) {
                throw new AppError("Appointments not found", 404);
            }

            return appointments.flatMap(appointment => {
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
                        patientId: appointment.patient.user_id,
                        ...appointment.patient.user.dataValues
                    },
                }
            });
        } catch (err) {
            throw err;
        }
    },
    getAllAppointmentsByPatient: async ({ patientId, limit, offset, startDate, endDate }) => {
        try {
            const offsetValue = offset * limit;

            const appointments = await db.Appointments.findAll({
                where: { patient_id: patientId },
                limit: limit,
                offset: offsetValue >= 0 ? offsetValue : 0,
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
                        where: {
                            date: {
                                [db.Sequelize.Op.between]: [startDate, endDate]
                            }
                        },
                        attributes: ["date", "interval"],
                        order: [['date', 'DESC']]
                    }
                ]
            });
            if (!appointments) {
                throw new AppError("Appointments not found", 404);
            }

            return appointments.map(appointment => {
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
            }).flat();
        } catch (err) {
            throw err;
        }
    },
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
