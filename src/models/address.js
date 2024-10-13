'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    static associate(models) {
      Address.belongsTo(models.Patients, {
        foreignKey: "user_id",
      })
    }
  }
  Address.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    street: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    home: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    flat: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    post_index: {
      type: DataTypes.CHAR(6),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Addresses',
  });
  return Address;
};