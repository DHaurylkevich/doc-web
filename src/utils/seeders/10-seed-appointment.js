'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        // Получаем существующие данные
        const patients = await queryInterface.sequelize.query(
            `SELECT id FROM Patients;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const schedules = await queryInterface.sequelize.query(
            `SELECT id, start_time, end_time, \`interval\` FROM Schedules;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const doctors = await queryInterface.sequelize.query(
            `SELECT id FROM Doctors;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const doctorServices = await queryInterface.sequelize.query(
            `SELECT id FROM DoctorServices;`,
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

        const appointments = patients.map((patient) => {
            const scheduleIndex = faker.number.int({ min: 0, max: schedules.length - 1 });
            const doctorIndex = faker.number.int({ min: 0, max: doctors.length - 1 });
            const serviceIndex = faker.number.int({ min: 0, max: doctorServices.length - 1 });

            const schedule = schedules[scheduleIndex];
            const doctor = doctors[doctorIndex];
            const doctorService = doctorServices[serviceIndex];

            return {
                patient_id: patient.id,
                schedule_id: schedule.id,
                doctor_service_id: doctorService.id,
                timeSlot: getRandomTimeSlot(schedule), // Изменил timeSlot на time согласно миграции
                description: faker.lorem.sentence(),
                first_visit: faker.datatype.boolean(),
                visit_type: faker.helpers.arrayElement(['prywatna', 'NFZ']),
                status: faker.helpers.arrayElement(['active', 'canceled', 'completed']),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        });

        await queryInterface.bulkInsert('Appointments', appointments, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Appointments', null, {});
    }
};