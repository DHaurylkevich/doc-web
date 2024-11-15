'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Files extends Model {
        static associate(models) {
            Files.belongsTo(models.Messages, {
                foreignKey: 'message_id'
            });
        } 
    }
    Files.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        message_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Messages',
                key: 'id'
            }
        },
        file_url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        file_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        uploaded_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'Files',
        timestamps: false
    });
    return Files;
};
