'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Addresses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      city: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      street: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      home: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      flat: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      post_index: {
        type: DataTypes.CHAR(6),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Addresses');
  }
};