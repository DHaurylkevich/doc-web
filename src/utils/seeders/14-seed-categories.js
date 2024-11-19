'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const categories = [];

        for (let i = 0; i < 20; i++) {
            categories.push({
                name: faker.commerce.department(),
            });
        }

        await queryInterface.bulkInsert('Categories', categories, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Categories', null, {});
    }
};
