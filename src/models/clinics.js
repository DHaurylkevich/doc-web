'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Clinics extends Model {
    static associate(models) {
      Clinics.hasOne(models.Addresses, {
        foreignKey: 'clinic_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Clinics.hasMany(models.Doctors, {
        foreignKey: 'clinic_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Clinics.belongsTo(models.Schedules, {
        foreignKey: "clinic_id",
      });
      Clinics.belongsTo(models.Appointments, {
        foreignKey: "clinic_id"
      });
      // Clinics.hasMany(models.Reviews, {
      //   foreignKey: "review_id",
      // });
    }
  }
  Clinics.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registration_day: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    nr_license: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "email"
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    description: DataTypes.STRING(255),
    schedule: DataTypes.STRING(255),
  }, {
    sequelize,
    modelName: 'Clinics',
    timestamps: true,
  });
  return Clinics;
};