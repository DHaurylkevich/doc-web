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
             LEFT JOIN doctor_services ON schedules.doctor_id = doctor_services.doctor_id;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        // const doctors = await queryInterface.sequelize.query(
        //     `SELECT id FROM doctors;`,
        //     { type: Sequelize.QueryTypes.SELECT }
        // );

        const doctorServices = await queryInterface.sequelize.query(
            `SELECT id FROM doctor_services;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const getRandomTimeSlot = (schedule) => {
            try {
                // Устанавливаем фиксированные значения, если данные некорректны
                const defaultStart = '09:00';
                const defaultEnd = '17:00';
                const defaultInterval = 30;

                const start_time = schedule.start_time || defaultStart;
                const end_time = schedule.end_time || defaultEnd;
                const interval = parseInt(schedule.interval) || defaultInterval;

                const startMinutes = timeToMinutes(start_time);
                const endMinutes = timeToMinutes(end_time);

                // Создаем массив доступных слотов
                const slots = [];
                for (let time = startMinutes; time < endMinutes; time += interval) {
                    slots.push(minutesToTime(time));
                }

                // Если слоты есть, выбираем случайный
                if (slots.length > 0) {
                    return slots[faker.number.int({ min: 0, max: slots.length - 1 })];
                }

                // Если что-то пошло не так, возвращаем значение по умолчанию
                return defaultStart;
            } catch (error) {
                console.log('Error in getRandomTimeSlot:', error);
                return '09:00'; // Значение по умолчанию
            }
        };

        const timeToMinutes = (time) => {
            try {
                const [hours, minutes] = time.toString().split(':').map(Number);
                return (hours || 0) * 60 + (minutes || 0);
            } catch (error) {
                console.log('Error in timeToMinutes:', error);
                return 0;
            }
        };

        const minutesToTime = (minutes) => {
            try {
                const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
                const mins = (minutes % 60).toString().padStart(2, '0');
                return `${hours}:${mins}`;
            } catch (error) {
                console.log('Error in minutesToTime:', error);
                return '00:00';
            }
        };
        const doctors = schedules.map((schedule) => {
            return {
                doctor_id: schedule.doctor_id,
                doctorService: doctorServices.find((service) => service.doctor_id === schedule.doctor_id)
            }
        });

        const appointments = patients.map((patient) => {
            const scheduleIndex = faker.number.int({ min: 0, max: schedules.length - 1 });
            const schedule = schedules[scheduleIndex];

            if (!schedule.doctor_service_id) {
                console.warn(`Doctor service not found for doctor_id: ${schedule.doctor_id}`);
                return null; // или выберите другой способ обработки
            }

            return {
                patient_id: patient.id,
                schedule_id: schedule.id,
                clinic_id: schedule.clinic_id,
                doctor_service_id: schedule.doctor_service_id,
                timeSlot: getRandomTimeSlot(schedule),
                description: faker.lorem.sentence(),
                first_visit: faker.datatype.boolean(),
                visit_type: faker.helpers.arrayElement(['prywatna', 'NFZ']),
                status: faker.helpers.arrayElement(['active', 'canceled', 'completed']),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        });

        await queryInterface.bulkInsert('appointments', appointments, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('appointments', null, {});
    }
};