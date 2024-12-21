'use strict';
const { fakerPL } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const specialties = [];

        for (let i = 0; i < 10; i++) {
            specialties.push({
                name: fakerPL.person.jobType(),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        await queryInterface.bulkInsert('specialties', specialties, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('specialties', null, {});
    }
};
