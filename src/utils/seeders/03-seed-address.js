'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const clinics = await queryInterface.sequelize.query(
            `SELECT id FROM clinics;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const addresses = clinics.map((clinic) => ({
            clinic_id: clinic.id,
            city: faker.location.city(),
            street: faker.location.street(),
            province: faker.location.state(),
            home: faker.location.buildingNumber(),
            post_index: faker.location.zipCode('#####'),
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        await queryInterface.bulkInsert('addresses', addresses, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('addresses', null, {});
    }
};
