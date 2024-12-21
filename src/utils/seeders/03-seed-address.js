'use strict';
const { fakerPL } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const clinics = await queryInterface.sequelize.query(
            `SELECT id FROM clinics;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        let addresses = clinics.map((clinic) => ({
            clinic_id: clinic.id,
            city: fakerPL.location.city(),
            street: fakerPL.location.street(),
            province: fakerPL.location.state(),
            home: fakerPL.location.buildingNumber(),
            flat: fakerPL.location.buildingNumber(),
            post_index: fakerPL.location.zipCode('#####'),
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        await queryInterface.bulkInsert('addresses', addresses, {});

        const users = await queryInterface.sequelize.query(
            `SELECT id FROM users;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        addresses = users.map((user) => ({
            user_id: user.id,
            city: fakerPL.location.city(),
            street: fakerPL.location.street(),
            flat: fakerPL.location.buildingNumber(),
            province: fakerPL.location.state(),
            home: fakerPL.location.buildingNumber(),
            post_index: fakerPL.location.zipCode('#####'),
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        await queryInterface.bulkInsert('addresses', addresses, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('addresses', null, {});
    }
};
