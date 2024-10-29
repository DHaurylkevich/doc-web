'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Appointments extends Model {
    static associate(models) {
      Appointments.belongsTo(models.Doctors, {
        foreignKey: "doctor_id"
      });
      Appointments.belongsTo(models.Patients, {
        foreignKey: "patient_id"
      });
      Appointments.hasOne(models.Clinics, {
        foreignKey: "clinic_id"
      });
      Appointments.belongsTo(models.Schedules, {
        foreignKey: "schedule_id"
      });
      // Appointments.belongsTo(models.Offer, {
      //   foreignKey: "offer_id"
      // });
    }
  }
  Appointments.init({
    time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    first_visit: {
      type: DataTypes.ENUM('prywatna', 'NFZ'),
      allowNull: true
    },
    visit_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'canceled'),
      allowNull: true
    },
  }, {
    sequelize,
    modelName: 'Appointments',
  });
  return Appointments;
};