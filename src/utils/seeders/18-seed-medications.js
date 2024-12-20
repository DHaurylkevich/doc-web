'use strict';

const { fakerPL } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const medications = [];

        for (let i = 0; i < 10; i++) {
            medications.push({
                name: fakerPL.commerce.productName(),
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        await queryInterface.bulkInsert('medications', medications, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('medications', null, {});
    }
};

