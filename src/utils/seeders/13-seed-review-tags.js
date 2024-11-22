'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
    async up(queryInterface, Sequelize) {
        const reviews = await queryInterface.sequelize.query(
            `SELECT id FROM reviews;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const tags = await queryInterface.sequelize.query(
            `SELECT id FROM tags;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const reviewTags = [];

        for (let i = 0; i < 100; i++) {
            reviewTags.push({
                review_id: reviews[faker.number.int({ min: 0, max: reviews.length - 1 })].id,
                tag_id: tags[faker.number.int({ min: 0, max: tags.length - 1 })].id,
            });
        }

        await queryInterface.bulkInsert('review_tags', reviewTags, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('review_tags', null, {});
    }
};
