const db = require("../models");
const DoctorService = require("../services/doctorService");
const ClinicService = require("../services/clinicService");
const UserService = require("../services/userService");
const ScheduleService = require("../services/scheduleService");

const AppointmentService = {
    createAppointment: async (appointmentData) => {
        const { doctor_id, user_id, clinic_id, schedule_id, time, description, first_visit, visit_type, status } = appointmentData;

        await DoctorService.getDoctorById(doctor_id);
        await ClinicService.getClinicById(clinic_id);
        const user = await UserService.getUserById(user_id);
        const patient = user.getPatients();
        if (!patient) {
            throw new Error("Patient not found");
        }

        const schedule = await ScheduleService.getScheduleById(schedule_id);

        const slots = AppointmentService.getAvailableSlots(schedule);
        if (!slots.includes(time)) {
            throw new Error("Invalid or unavailable time slot");
        }

        const existingAppointment = await db.Appointments.findOne({
            where: { time, clinic_id, doctor_id, patients_id: patient.id, schedule_id },
        });
        if (existingAppointment) {
            throw new Error("Appointment already exists");
        }

        try {
            const newAppointment = await db.Appointments.create({
                doctor_id,
                clinic_id,
                schedule_id,
                patients_id: patient.id,
                time,
                description,
                first_visit,
                visit_type,
                status
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
    /**
     * Получение всех слотов
     * @param {*} schedule 
     * @returns 
     */
    getAvailableSlots: (schedule) => {
        const { start_time, end_time, interval } = schedule;

        const start = AppointmentService.timeToMinutes(start_time);
        const end = AppointmentService.timeToMinutes(end_time);
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
