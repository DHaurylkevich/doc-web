'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Doctors extends Model {
    static associate(models) {
      Doctors.belongsTo(models.Users, {
        foreignKey: 'user_id',
      });
      Doctors.belongsTo(models.Clinics, {
        foreignKey: 'clinic_id',
      });
      Doctors.belongsTo(models.Specialties, {
        foreignKey: 'specialty_id',
        as: 'specialty',
      });
      Doctors.belongsToMany(models.Services, {
        through: models.DoctorService,
        foreignKey: 'doctor_id',
        otherKey: 'service_id',
        as: 'services',
      });
      Doctors.hasMany(models.Schedules, {
        foreignKey: "doctor_id",
        onDelete: 'CASCADE',
      });
    }
  }
  Doctors.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    hired_at: DataTypes.DATE,//может и не нужно
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Doctors',
  });
  return Doctors;
};