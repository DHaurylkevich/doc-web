'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const doctors = await queryInterface.sequelize.query(
            `SELECT id, clinic_id FROM doctors;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const services = await queryInterface.sequelize.query(
            `SELECT id, clinic_id FROM services;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const usedPairs = new Set();
        const doctorServices = [];

        let attempts = 0;
        const maxAttempts = 100;

        while (doctorServices.length < 50 && attempts < maxAttempts) {
            // Выбираем случайного врача и услугу
            const doctor = doctors[faker.number.int({ min: 0, max: doctors.length - 1 })];
            const service = services[faker.number.int({ min: 0, max: services.length - 1 })];

            // Проверяем совпадение clinic_id
            if (doctor.clinic_id === service.clinic_id) {
                const pairKey = `${doctor.id}-${service.id}`;

                // Проверяем, использовалась ли эта пара ранее
                if (!usedPairs.has(pairKey)) {
                    usedPairs.add(pairKey);
                    doctorServices.push({
                        doctor_id: doctor.id,
                        service_id: service.id,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }
            }

            attempts++;
        }

        if (doctorServices.length > 0) {
            await queryInterface.bulkInsert('doctor_services', doctorServices, {});
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('doctor_services', null, {});
    }
};