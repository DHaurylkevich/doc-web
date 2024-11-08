'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Categories extends Model {
        static associate(models) {
            Categories.hasMany(models.Posts, {
                foreignKey: 'category_id',
                as: 'posts',
            });
        }
    }
    Categories.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        }
    }, {
        sequelize,
        modelName: 'Categories',
        timestamps: false,
    });
    return Categories;
};
