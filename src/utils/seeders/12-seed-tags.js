'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const tags = [
            { name: 'Fast service', positive: true },
            { name: 'Slow service', positive: false },
            { name: 'Friendly staff', positive: true },
            { name: 'Unfriendly staff', positive: false },
            { name: 'Clean environment', positive: true },
            { name: 'Dirty environment', positive: false },
            { name: 'Good quality', positive: true },
            { name: 'Poor quality', positive: false },
            { name: 'Affordable prices', positive: true },
            { name: 'Expensive prices', positive: false },
            { name: 'Quick response', positive: true },
            { name: 'Slow response', positive: false },
            { name: 'Helpful', positive: true },
            { name: 'Unhelpful', positive: false },
            { name: 'Professional', positive: true },
            { name: 'Unprofessional', positive: false },
            { name: 'Well organized', positive: true },
            { name: 'Disorganized', positive: false },
            { name: 'High quality', positive: true },
            { name: 'Low quality', positive: false },
            { name: 'Great experience', positive: true },
            { name: 'Bad experience', positive: false },
            { name: 'Highly recommended', positive: true },
            { name: 'Not recommended', positive: false },
            { name: 'Excellent service', positive: true },
            { name: 'Poor service', positive: false },
            { name: 'Timely delivery', positive: true },
            { name: 'Late delivery', positive: false },
            { name: 'Polite staff', positive: true },
            { name: 'Rude staff', positive: false },
            { name: 'Good atmosphere', positive: true },
            { name: 'Bad atmosphere', positive: false },
            { name: 'Tasty food', positive: true },
            { name: 'Bad food', positive: false },
            { name: 'Comfortable', positive: true },
            { name: 'Uncomfortable', positive: false },
            { name: 'Convenient location', positive: true },
            { name: 'Inconvenient location', positive: false },
            { name: 'Good value', positive: true },
            { name: 'Poor value', positive: false },
            { name: 'Efficient', positive: true },
            { name: 'Inefficient', positive: false },
            { name: 'Knowledgeable staff', positive: true },
            { name: 'Unknowledgeable staff', positive: false },
            { name: 'Responsive', positive: true },
            { name: 'Unresponsive', positive: false },
            { name: 'Reliable', positive: true },
            { name: 'Unreliable', positive: false },
            { name: 'Trustworthy', positive: true },
            { name: 'Untrustworthy', positive: false }
        ];

        await queryInterface.bulkInsert('tags', tags, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('tags', null, {});
    }
};
