'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DoctorService', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      doctor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Doctors', // Убедитесь, что имя таблицы указано верно
          key: 'id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      },
      specialty_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Specialties', // Убедитесь, что имя таблицы указано верно
          key: 'id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DoctorService');
  }
};
