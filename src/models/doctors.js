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
      Doctors.belongsToMany(models.Specialties, {
        through: models.DoctorSpecialty,
        foreignKey: 'doctor_id',
        otherKey: 'specialty_id',
        as: 'specialties',
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
    hired_at: DataTypes.DATE,
    description: DataTypes.STRING(255),
  }, {
    sequelize,
    modelName: 'Doctors',
  });
  return Doctors;
};