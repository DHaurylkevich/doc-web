'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        // Получаем существующие пользователей с ролью "doctor", клиники и специальности
        const users = await queryInterface.sequelize.query(
            `SELECT id FROM users WHERE role = 'doctor';`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const clinics = await queryInterface.sequelize.query(
            `SELECT id FROM clinics;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const specialties = await queryInterface.sequelize.query(
            `SELECT id FROM specialties;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const doctors = users.map((user) => ({
            user_id: user.id,
            clinic_id: clinics[faker.number.int({ min: 0, max: clinics.length - 1 })].id,
            specialty_id: specialties[faker.number.int({ min: 0, max: specialties.length - 1 })].id,
            rating: faker.number.float({ min: 0, max: 5, precision: 0.1 }),
            hired_at: faker.date.past(),
            description: faker.lorem.sentence(),
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        await queryInterface.bulkInsert('doctors', doctors, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('doctors', null, {});
    }
};
