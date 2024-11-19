'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const clinics = await queryInterface.sequelize.query(
            `SELECT id FROM Clinics;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const specialties = await queryInterface.sequelize.query(
            `SELECT id FROM Specialties;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const services = [];

        for (let i = 0; i < 20; i++) {
            services.push({
                name: faker.commerce.productName(),
                price: faker.number.float({ min: 50, max: 500, precision: 0.01 }),
                clinic_id: clinics[faker.number.int({ min: 0, max: clinics.length - 1 })].id,
                specialty_id: specialties[faker.number.int({ min: 0, max: specialties.length - 1 })].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        await queryInterface.bulkInsert('Services', services, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Services', null, {});
    }
};