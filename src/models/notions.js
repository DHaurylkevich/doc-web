'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Notions extends Model {
        static associate(models) {
            Notions.belongsTo(models.Users, {
                foreignKey: 'user_id',
                as: 'admin',
            });
        }
    }
    Notions.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Notions',
        timestamps: true,
    });
    return Notions;
};