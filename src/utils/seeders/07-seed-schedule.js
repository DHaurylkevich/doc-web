'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const doctors = await queryInterface.sequelize.query(
            `SELECT id, clinic_id FROM doctors;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const schedules = [];
        doctors.forEach(doctor => {
            const startHour = faker.number.int({ min: 8, max: 10 });
            const endHour = faker.number.int({ min: 16, max: 18 });

            schedules.push({
                doctor_id: doctor.id,
                clinic_id: doctor.clinic_id,
                interval: faker.number.int({ min: 10, max: 60 }),
                date: faker.date.future().toISOString().split('T')[0],
                start_time: `${startHour}:00`,
                end_time: `${endHour}:00`,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        });

        await queryInterface.bulkInsert('schedules', schedules, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('schedules', null, {});
    }
};