'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const posts = [];

        for (let i = 0; i < 100; i++) {
            posts.push({
                photo: faker.image.url(),
                title: faker.lorem.sentence(),
                content: faker.lorem.paragraphs(),
            });
        }

        await queryInterface.bulkInsert('Posts', posts, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Posts', null, {});
    }
};
