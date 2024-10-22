'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Schedules extends Model {
    static associate(models) {
      Schedules.belongsTo(models.Doctors, {
        foreignKey: "doctor_id"
      });
      Schedules.belongsTo(models.Clinics, {
        foreignKey: "clinic_id"
      });
    }
  }
  Schedules.init({
    interval: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
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
  });
  return Schedules;
};