'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Patients extends Model {
    static associate(models) {
      Patients.belongsTo(models.Users, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE'
      });
      Patients.belongsTo(models.Addresses, {
        foreignKey: 'address_id'
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true
    },
    address_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    market_inf: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Patients',
    timestamps: true,
  });
  return Patients;
};