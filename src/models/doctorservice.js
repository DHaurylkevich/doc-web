'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DoctorService extends Model {
    static associate(models) {
      DoctorService.belongsTo(models.Doctors, {
        foreignKey: 'doctor_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        as: 'doctor'
      });
      DoctorService.belongsTo(models.Services, {
        foreignKey: 'service_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        as: 'service'
      });
    }
  }
  DoctorService.init({
  }, {
    sequelize,
    modelName: 'DoctorService',
    timestamps: false,
  });
  return DoctorService;
};