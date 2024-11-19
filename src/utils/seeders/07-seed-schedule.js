'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        // Получаем существующих врачей и клиники
        const doctors = await queryInterface.sequelize.query(
            `SELECT id FROM Doctors;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const clinics = await queryInterface.sequelize.query(
            `SELECT id FROM Clinics;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const schedules = doctors.map((doctor) => ({
            doctor_id: doctor.id,
            clinic_id: clinics[faker.number.int({ min: 0, max: clinics.length - 1 })].id,
            interval: faker.number.int({ min: 10, max: 60 }),
            date: faker.date.future(),
            start_time: faker.date.future().toISOString().slice(11, 16),
            end_time: faker.date.future().toISOString().slice(11, 16),
        }));


        await queryInterface.bulkInsert('Schedules', schedules, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Schedules', null, {});
    }
};
