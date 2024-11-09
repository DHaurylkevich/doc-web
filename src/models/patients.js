'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Patients extends Model {
    static associate(models) {
      Patients.belongsTo(models.Users, {
        foreignKey: 'user_id',
        as: 'user',
      });
      Patients.hasOne(models.Addresses, {
        foreignKey: 'patient_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Patients.hasMany(models.Appointments, {
        foreignKey: "patient_id",
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
    },
    market_inf: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Patients',
  });
  return Patients;
};