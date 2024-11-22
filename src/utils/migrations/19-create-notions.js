'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('notions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            title: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            author_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },
            priority: {
                type: Sequelize.ENUM('low', 'medium', 'high'),
                defaultValue: 'medium'
            },
            status: {
                type: Sequelize.ENUM('active', 'archived'),
                defaultValue: 'active'
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('notions');
    }
};