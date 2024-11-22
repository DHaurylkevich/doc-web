'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const notions = [];

        for (let i = 0; i < 50; i++) {
            notions.push({
                content: faker.lorem.sentences({ min: 1, max: 3 }),
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        await queryInterface.bulkInsert('notions', notions, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('notions', null, {});
    }
};
