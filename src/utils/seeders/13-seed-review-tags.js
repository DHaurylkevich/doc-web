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

        const reviewTags = new Set();

        while (reviewTags.size < 100) {
            const reviewId = reviews[faker.number.int({ min: 0, max: reviews.length - 1 })].id;
            const tagId = tags[faker.number.int({ min: 0, max: tags.length - 1 })].id;

            reviewTags.add(`${reviewId}-${tagId}`);
        }

        const reviewTagsArray = Array.from(reviewTags).map(tag => {
            const [review_id, tag_id] = tag.split('-');
            return { review_id: parseInt(review_id), tag_id: parseInt(tag_id) };
        });

        await queryInterface.bulkInsert('review_tags', reviewTagsArray, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('review_tags', null, {});
    }
};
