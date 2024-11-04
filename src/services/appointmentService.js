const db = require("../models");
const ClinicService = require("../services/clinicService");
const UserService = require("../services/userService");

const AppointmentService = {
    createAppointment: async (doctorId, doctorServiceId, clinicId, userId, date, timeSlot, firstVisit, visitType, status, description) => {
        const schedule = await db.Schedules.findOne({
            where: { doctor_id: doctorId, date: date },
        });
        if (!schedule) {
            throw new Error("This Schedule doesn't exist");
        }

        await ClinicService.getClinicById(clinicId);
        const user = await UserService.getUserById(userId);
        const patient = user.getPatient();
        if (!patient) {
            throw new Error("Patient not found");
        }

        const existingAppointment = await db.Appointments.findOne({
            where: { schedule_id: schedule.id, timeSlot: timeSlot },
        });
        if (existingAppointment) {
            throw new Error("Appointment already exists");
        }

        try {
            const newAppointment = await db.Appointments.create({
                clinic_id: clinicId,
                schedule_id: schedule.id,
                patients_id: patient.id,
                doctor_service_id: doctorServiceId,
                timeSlot: timeSlot,
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
                throw new Error("Appointment not found");
            }

            return appointment;
        } catch (err) {
            throw err;
        }
    },

    updateAppointment: async (id, data) => {
        try {
            let appointment = await db.Appointments.findByPk(id);

            if (!appointment) {
                throw new Error("Appointment not found");
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
                throw new Error("Appointment not found");
            }

            await appointment.destroy();
        } catch (err) {
            throw err;
        }
    },
    getAllAppointmentsByDoctor: async (doctorId) => {
        try {
            const appointments = await db.Appointments.findAll({
                include: [
                    {
                        model: db.DoctorService, as: "doctorService",
                        where: { doctor_id: doctorId },
                    }
                ]
            });
            if (!appointments) {
                throw new Error("Appointments not found");
            }

            return appointments;
        } catch (err) {
            throw err;
        }
    },
    getAllAppointmentsByPatient: async (patientId) => {
        try {
            const appointments = await db.Appointments.findAll({
                where: { patient_id: patientId },
                include: [
                    {
                        model: db.DoctorService, as: "doctorService",
                    }
                ]
            });
            if (!appointments) {
                throw new Error("Appointments not found");
            }

            return appointments;
        } catch (err) {
            throw err;
        }
    },
    getAvailableSlotsWithFilter: async (filters) => {
        try {
            const doctors = await db.Doctors.findAll({
                attributes: ["id", "description", "rating"],
                limit: parseInt(filters.limit),
                offset: parseInt(filters.offset),
                include: [
                    {
                        model: db.Clinics,
                        // as: 'clinic',
                        // attributes: [],
                        include: [
                            {
                                model: db.Addresses,
                                as: "address",
                                where: { city: filters.city },
                                attributes: ["city", "street", "home", "flat", "post_index"],
                            }
                        ]
                    },
                    {
                        model: db.Specialties,
                        as: "specialty",
                        where: { name: filters.specialty },
                        attributes: ["name"],
                    },
                    {
                        model: db.Schedules,
                        where: { date: filters.date },
                        attributes: ["id", "date", "interval", "end_time", "start_time"],
                        include: [
                            {
                                model: db.Appointments,
                                attributes: ["timeSlot"]
                                // include: [
                                //     {
                                //         model: db.DoctorService,
                                //         as: "doctorService",
                                //         include: [
                                //             {
                                //                 model: db.Services,
                                //                 as: "service",
                                //                 attributes: ["name", "price"]
                                //             }
                                //         ]
                                //     }
                                // ]
                            }
                        ]
                    },
                ]
            });
            if (!doctors.length) {
                return [];
            }

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
