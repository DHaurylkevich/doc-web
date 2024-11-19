'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ReviewTags', {
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
                    model: 'Reviews',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            tag_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Tags',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            }
        });

        // Добавляем уникальный составной индекс
        await queryInterface.addIndex('ReviewTags', ['review_id', 'tag_id'], {
            unique: true,
            name: 'review_tag_unique'
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('ReviewTags');
    }
};