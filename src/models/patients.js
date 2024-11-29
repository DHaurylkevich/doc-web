'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Patients extends Model {
    static associate(models) {
      Patients.belongsTo(models.Users, {
        foreignKey: 'user_id',
        as: 'user',
      });
      Patients.hasMany(models.Appointments, {
        foreignKey: "patient_id",
        as: 'appointments',
      });
      Patients.hasMany(models.Reviews, {
        foreignKey: "patient_id",
        as: "reviews"
      });
      Patients.hasMany(models.Prescriptions, {
        foreignKey: 'medication_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }
  Patients.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    }
  }, {
    sequelize,
    modelName: 'Patients',
    tableName: 'patients',
  });
  return Patients;
};