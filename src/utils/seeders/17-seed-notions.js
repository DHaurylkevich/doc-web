'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const notions = [];

        for (let i = 0; i < 50; i++) {
            notions.push({
                content: faker.lorem.paragraphs(),
            });
        }

        await queryInterface.bulkInsert('Notions', notions, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Notions', null, {});
    }
};
