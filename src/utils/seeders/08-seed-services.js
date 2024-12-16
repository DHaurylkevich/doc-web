'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const clinics = await queryInterface.sequelize.query(
            `SELECT id FROM clinics;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const specialties = await queryInterface.sequelize.query(
            `SELECT id FROM specialties;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const services = [];
        const serviceNames = [
            "ULTRASOUND'",
            "X-ray",
            "Blood test'",
            "ECG",
            "Vaccination'",
            "Physiotherapy",
            "MRI",
            "CT SCAN",
            "Massage"
        ];

        clinics.forEach(clinic => {
            const numServices = faker.number.int({ min: 3, max: 5 });
            const selectedServices = faker.helpers.arrayElements(serviceNames, numServices);

            selectedServices.forEach(serviceName => {
                services.push({
                    name: serviceName,
                    price: faker.number.float({ min: 50, max: 500, precision: 0.01 }),
                    clinic_id: clinic.id,
                    specialty_id: specialties[faker.number.int({ min: 0, max: specialties.length - 1 })].id,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            });
        });

        await queryInterface.bulkInsert('services', services, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('services', null, {});
    }
};