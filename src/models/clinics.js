"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Clinics extends Model {
    static associate(models) {
      Clinics.hasOne(models.Addresses, {
        foreignKey: "clinic_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        as: "address"
      });
      Clinics.hasMany(models.Doctors, {
        foreignKey: "clinic_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        as: "doctors"
      });
      Clinics.hasMany(models.Schedules, {
        foreignKey: "clinic_id",
        as: "schedules"
      });
      Clinics.hasMany(models.Services, {
        foreignKey: "clinic_id",
        as: "services",
      });
      Clinics.hasMany(models.Appointments, {
        foreignKey: "clinic_id",
        as: "appointments"
      });
      Clinics.hasMany(models.ChatParticipants, {
        foreignKey: 'user_id',
        constraints: false,
        as: 'chatParticipants',
      });
    }
  }
  Clinics.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "clinic"
    },
    password: {
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
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "clinic"
    },
    description: DataTypes.STRING(255),
    schedule: DataTypes.STRING(255),
    resetToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: "Clinics",
    tableName: 'clinics',
    timestamps: true,
  });
  return Clinics;
};