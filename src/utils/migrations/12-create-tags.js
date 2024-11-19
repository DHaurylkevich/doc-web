'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {ц
        await queryInterface.createTable('Tags', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: false
            },
            positive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Tags');
    }
};