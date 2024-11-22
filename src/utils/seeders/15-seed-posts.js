'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const posts = [];

        for (let i = 0; i < 100; i++) {
            posts.push({
                photo: faker.image.url(),
                title: faker.lorem.sentence(1),
                content: faker.lorem.text(),
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        await queryInterface.bulkInsert('posts', posts, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('posts', null, {});
    }
};
