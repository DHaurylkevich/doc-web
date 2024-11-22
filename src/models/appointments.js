'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Appointments extends Model {
    static associate(models) {
      Appointments.belongsTo(models.Patients, {
        foreignKey: "patient_id"
      });
      Appointments.belongsTo(models.Clinics, {
        foreignKey: "clinic_id"
      });
      Appointments.belongsTo(models.Schedules, {
        foreignKey: "schedule_id"
      });
      Appointments.belongsTo(models.DoctorService, {
        foreignKey: 'doctor_service_id',
        as: 'doctorService'
      });
    }
  }
  Appointments.init({
    timeSlot: {
      type: DataTypes.TIME,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    first_visit: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    visit_type: {
      type: DataTypes.ENUM('prywatna', 'NFZ'),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'canceled', 'completed'),
      allowNull: true
    },
  }, {
    sequelize,
    modelName: 'Appointments',
    tableName: 'appointments',
  });
  return Appointments;
};