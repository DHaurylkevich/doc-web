'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const patients = await queryInterface.sequelize.query(
            `SELECT id FROM patients;`,
            { type: Sequelize.QueryTypes.SELECT }
        );
        const schedules = await queryInterface.sequelize.query(
            `SELECT schedules.id, schedules.start_time, schedules.end_time, schedules.interval, 
                    schedules.clinic_id, schedules.doctor_id, doctor_services.id AS doctor_service_id
            FROM schedules
            INNER JOIN doctor_services ON schedules.doctor_id = doctor_services.doctor_id;`,
            { type: Sequelize.QueryTypes.SELECT }
        );
        const timeToMinutes = (time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };
        const minutesToTime = (minutes) => {
            const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
            const mins = (minutes % 60).toString().padStart(2, '0');
            return `${hours}:${mins}`;
        };
        const getAvailableSlots = (schedule) => {
            const { start_time, end_time, interval } = schedule;

            const start = timeToMinutes(start_time.slice(0, -3));
            const end = timeToMinutes(end_time.slice(0, -3));
            const slots = [];

            for (let time = start; time < end; time += interval) {
                slots.push(minutesToTime(time));
            }

            return slots;
        };

        const getRandomTimeSlot = (slots) => {
            try {
                const randomIndex = faker.number.int({ min: 0, max: slots.length - 1 });
                const selectedSlot = slots[randomIndex];
                slots.splice(randomIndex, 1);
                return selectedSlot;
            } catch (error) {
                console.log('Error in getRandomTimeSlot:', error);
                return '09:00';
            }
        };

        const appointments = [];
        patients.forEach((patient) => {
            const appointmentCount = faker.number.int({ min: 1, max: 3 });

            const validSchedules = schedules.filter(schedule => schedule.doctor_service_id);
            const schedule = faker.helpers.arrayElement(validSchedules);
            const availableSlots = getAvailableSlots(schedule);

            for (let i = 0; i < appointmentCount; i++) {
                appointments.push({
                    patient_id: patient.id,
                    schedule_id: schedule.id,
                    clinic_id: schedule.clinic_id,
                    doctor_service_id: schedule.doctor_service_id,
                    time_slot: getRandomTimeSlot(availableSlots),
                    description: faker.lorem.sentence(),
                    first_visit: faker.datatype.boolean(),
                    visit_type: faker.helpers.arrayElement(['prywatna', 'NFZ']),
                    status: faker.helpers.arrayElement(['active', 'canceled', 'completed']),
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        });

        if (appointments.length === 0) {
            console.warn('No appointments were generated');
            return;
        }

        await queryInterface.bulkInsert('appointments', appointments, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('appointments', null, {});
    }
};