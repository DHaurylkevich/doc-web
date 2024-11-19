'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const users = await queryInterface.sequelize.query(
            `SELECT id FROM Users WHERE role = 'patient';`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const patients = users.map((user) => ({
            user_id: user.id,
            market_inf: faker.datatype.boolean(),
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        await queryInterface.bulkInsert('Patients', patients, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Patients', null, {});
    }
};
