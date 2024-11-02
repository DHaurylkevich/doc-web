const { Op } = require("sequelize");
const db = require("../models");
// const DoctorService = require("../services/doctorService");
// const ClinicService = require("../services/clinicService");

const ScheduleService = {
    createSchedule: async (scheduleData) => {
        const transaction = await db.sequelize.transaction();

        try {
            const { doctorsIds, ...commonData } = scheduleData;
            const existingDoctors = await db.Doctors.findAll({
                where: { id: { [Op.in]: doctorsIds } },
                attributes: ['id'],
                transaction
            });
            if (existingDoctors.length !== doctorsIds.length) {
                throw new Error("One or more doctors do not exist.");
            }
            const clinicId = scheduleData.clinic_id;
            const existingClinic = await db.Clinics.findByPk(clinicId, {
                attributes: ['id'],
                transaction
            });
            if (!existingClinic) {
                throw new Error(`Clinic does not exist.`);
            }
            scheduleData = doctorsIds.map(doctorId => ({
                ...commonData,
                doctor_id: doctorId
            }));
            console.log(scheduleData)
            const existingSchedules = await db.Schedules.findAll({
                where: {
                    [Op.or]: scheduleData
                },
                transaction
            });
            if (existingSchedules.length > 0) {
                throw new Error("One or more schedules already exist.");
            }
            const createdSchedules = await db.Schedules.bulkCreate(scheduleData, { transaction });

            await transaction.commit();
            return createdSchedules;
        } catch (err) {
            await transaction.rollback();
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