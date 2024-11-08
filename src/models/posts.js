'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Posts extends Model {
        static associate(models) {
            Posts.belongsTo(models.Categories, {
                foreignKey: 'category_id',
                as: 'category',
            });
        }
    }
    Posts.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        photo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Posts',
        timestamps: true,
    });
    return Posts;
};