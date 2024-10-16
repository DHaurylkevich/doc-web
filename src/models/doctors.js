'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Doctors extends Model {
    static associate(models) {
      Doctors.belongsTo(models.Users, {
        foreignKey: 'user_id',
      });
      // Doctors.belongsTo(models.Clinic, {
      //   foreignKey: "clinic_id",
      // });
      // Doctors.hasOne(models.Schedules, {
      //   foreignKey: "schedule_id",
      // });
      // Doctors.hasMany(models.Reviews, {
      //   foreignKey: "review_id",
      // });
      // Doctors.belongsToMany(models.Specialties, {
      //   through: "DoctorSpecialty",
      // });
    }
  }
  Doctors.init({
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    hired_at: DataTypes.DATE,
    description: DataTypes.STRING(255),
  }, {
    sequelize,
    modelName: 'Doctors',
  });
  return Doctors;
};