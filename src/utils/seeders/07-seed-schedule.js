'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const doctors = await queryInterface.sequelize.query(
            `SELECT id, clinic_id FROM doctors;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const schedules = doctors.flatMap((doctor) => {
            return Array.from({ length: 100 }, () => ({
                doctor_id: doctor.id,
                clinic_id: doctor.clinic_id,
                interval: faker.number.int({ min: 10, max: 60 }),
                date: faker.date.future().toISOString().split('T')[0],
                start_time: faker.date.future().toISOString().slice(11, 16),
                end_time: faker.date.future().toISOString().slice(11, 16),
                createdAt: new Date(),
                updatedAt: new Date()
            }));
        });

        await queryInterface.bulkInsert('schedules', schedules, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('schedules', null, {});
    }
};