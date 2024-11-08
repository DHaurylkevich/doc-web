'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      Users.hasOne(models.Patients, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Users.hasOne(models.Doctors, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        as: "doctor"
      });
      Users.hasMany(models.Notions, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        as: "notions"
      });
      Users.hasOne(models.Addresses, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        as: "address"
      });
    }
  }
  Users.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    first_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "email"
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true
    },
    pesel: {
      type: DataTypes.STRING(11),
      allowNull: false,
      unique: "pesel"
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('patient', 'doctor', 'admin'),
      allowNull: false,
      defaultValue: "patient"
    },
    birthday: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Users',
    timestamps: true,
  });
  return Users;
};