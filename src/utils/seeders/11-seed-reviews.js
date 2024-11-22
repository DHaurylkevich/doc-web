'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const patients = await queryInterface.sequelize.query(
            `SELECT id FROM patients;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const doctors = await queryInterface.sequelize.query(
            `SELECT id FROM doctors;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const reviews = [];

        for (let i = 0; i < 100; i++) {
            reviews.push({
                patient_id: patients[faker.number.int({ min: 0, max: patients.length - 1 })].id,
                doctor_id: doctors[faker.number.int({ min: 0, max: doctors.length - 1 })].id,
                rating: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
                comment: faker.lorem.sentence(),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        await queryInterface.bulkInsert('reviews', reviews, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('reviews', null, {});
    }
};
