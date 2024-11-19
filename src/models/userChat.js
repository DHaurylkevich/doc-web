'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class UserChats extends Model {
        static associate(models) {
            UserChats.belongsTo(models.Users, {
                foreignKey: "user_id",
                constraints: false,
                as: 'user'
            });
            UserChats.belongsTo(models.Clinics, {
                foreignKey: 'user_id',
                constraints: false,
                as: 'clinic'
            });
            UserChats.belongsTo(models.Chats, {
                foreignKey: "chat_id"
            });
        }
    }
    UserChats.init({
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        chat_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Chats',
                key: 'id'
            }
        },
        client_offset: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        user_type: {
            type: DataTypes.ENUM('user', 'clinic'),
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'UserChats',
        tableName: 'user_chats',
    });
    return UserChats;
};