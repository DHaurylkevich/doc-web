'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Appointments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      patient_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Patients',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      doctor_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Doctors',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      clinic_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Clinics',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      first_visit: {
        type: Sequelize.ENUM('prywatna', 'NFZ'),
        allowNull: true
      },
      visit_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'completed', 'canceled'),
        allowNull: true
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
    await queryInterface.dropTable('Appointments');
  }
};
