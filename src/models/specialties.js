'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Specialties extends Model {
    static associate(models) {
      Specialties.belongsToMany(models.Doctors, {
        through: "DoctorsSpecialties",
      })
    }
  }
  Specialties.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name:{
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Specialties',
  });
  return Specialties;
};