'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        // Получаем существующих врачей и сервисы
        const doctors = await queryInterface.sequelize.query(
            `SELECT id FROM Doctors;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const services = await queryInterface.sequelize.query(
            `SELECT id FROM Services;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        // Создаем Set для отслеживания уникальных комбинаций
        const usedPairs = new Set();
        const doctorServices = [];

        // Пытаемся создать до 50 уникальных комбинаций
        let attempts = 0;
        const maxAttempts = 100; // Предотвращаем бесконечный цикл

        while (doctorServices.length < 50 && attempts < maxAttempts) {
            const doctorId = doctors[faker.number.int({ min: 0, max: doctors.length - 1 })].id;
            const serviceId = services[faker.number.int({ min: 0, max: services.length - 1 })].id;

            const pairKey = `${doctorId}-${serviceId}`;

            if (!usedPairs.has(pairKey)) {
                usedPairs.add(pairKey);
                doctorServices.push({
                    doctor_id: doctorId,
                    service_id: serviceId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }

            attempts++;
        }

        if (doctorServices.length > 0) {
            await queryInterface.bulkInsert('DoctorServices', doctorServices, {});
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('DoctorServices', null, {});
    }
};