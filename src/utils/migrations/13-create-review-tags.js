'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('review_tags', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            review_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'reviews',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            tag_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'tags',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            }
        });

        // Добавляем уникальный составной индекс
        await queryInterface.addIndex('review_tags', ['review_id', 'tag_id'], {
            unique: true,
            name: 'review_tag_unique'
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('review_tags');
    }
};