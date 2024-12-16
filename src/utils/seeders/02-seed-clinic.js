'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const clinics = [];

        clinics.push({
            photo: faker.image.url(),
            name: faker.company.name(),
            nip: faker.number.int({ min: 1000000000, max: 9999999999 }).toString(),
            nr_license: faker.vehicle.vin(),
            email: "clinic@gmail.com",
            password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
            phone: faker.phone.number({ style: 'international' }),
            description: faker.lorem.sentence(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        for (let i = 0; i < 10; i++) {
            clinics.push({
                photo: faker.image.url(),
                name: faker.company.name(),
                nip: faker.number.int({ min: 1000000000, max: 9999999999 }).toString(),
                nr_license: faker.vehicle.vin(),
                email: faker.internet.email(),
                password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                phone: faker.phone.number({ style: 'international' }),
                description: faker.lorem.sentence(),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        await queryInterface.bulkInsert('clinics', clinics, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('clinics', null, {});
    }
};