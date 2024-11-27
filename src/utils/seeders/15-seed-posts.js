'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const categories = await queryInterface.sequelize.query('SELECT id FROM categories', { type: Sequelize.QueryTypes.SELECT });

        // Проверяем, есть ли категории
        if (categories.length === 0) {
            throw new Error('No categories found');
        }

        const posts = [];

        for (let i = 0; i < 100; i++) {
            posts.push({
                photo: faker.image.url(),
                title: faker.lorem.sentence(1),
                content: faker.lorem.text(),
                category_id: categories[Math.floor(Math.random() * categories.length)].id, // Исправлено
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