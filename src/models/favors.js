'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Favors extends Model {
    static associate(models) {
      // define association here
    }
  }
  Favors.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Favors',
  });
  return Favors;
};