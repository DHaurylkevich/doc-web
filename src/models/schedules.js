'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Schedules extends Model {
    static associate(models) {
      Schedules.belongsTo(models.Doctors, {
        foreignKey: "doctor_id",
        as: "doctor"
      });
      Schedules.belongsTo(models.Clinics, {
        foreignKey: "clinic_id",
        as: "clinic"
      });
      Schedules.hasMany(models.Appointments, {
        foreignKey: "schedule_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      });
    }
  }
  Schedules.init({
    interval: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Schedules',
    tableName: 'schedules',
  });
  return Schedules;
};