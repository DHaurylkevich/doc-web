'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const users = [];
        const roleUser = [{ "role": "admin", "gmail": "admin@gmail.com" }, { "role": "doctor", "gmail": "doctor@gmail.com" }, { "gmail": "patient@gmail.com", "role": "patient" }]
        for (const user of roleUser) {
            users.push({
                photo: faker.image.avatar(),
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                email: user.gmail,
                gender: faker.helpers.arrayElement(['male', 'female', 'other']),
                pesel: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(),
                phone: faker.phone.number({ style: 'international' }),
                password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                role: user.role,
                birthday: faker.date.birthdate({ min: 18, max: 70, mode: 'age' }),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        for (let i = 0; i < 20; i++) {
            users.push({
                photo: faker.image.avatar(),
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                email: faker.internet.email(),
                gender: faker.helpers.arrayElement(['male', 'female', 'other']),
                pesel: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(),
                phone: faker.phone.number({ style: 'international' }),
                password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                role: 'doctor',
                birthday: faker.date.birthdate({ min: 18, max: 70, mode: 'age' }),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            users.push({
                photo: faker.image.avatar(),
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                email: faker.internet.email(),
                gender: faker.helpers.arrayElement(['male', 'female', 'other']),
                pesel: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(),
                phone: faker.phone.number({ style: 'international' }),
                password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                role: 'patient',
                birthday: faker.date.birthdate({ min: 18, max: 70, mode: 'age' }),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        await queryInterface.bulkInsert('users', users, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('users', null, {});
    }
};