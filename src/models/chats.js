'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Chats extends Model {
        static associate(models) {
            Chats.belongsTo(models.Users, {
                foreignKey: 'user_1_id',
                constraints: false,
                as: 'user1'
            });
            Chats.belongsTo(models.Clinics, {
                foreignKey: 'user_1_id',
                constraints: false,
                as: 'clinic1'
            });
            Chats.belongsTo(models.Users, {
                foreignKey: 'user_2_id',
                constraints: false,
                as: 'user2'
            });
            Chats.belongsTo(models.Clinics, {
                foreignKey: 'user_2_id',
                constraints: false,
                as: 'clinic2'
            });
            Chats.hasMany(models.Messages, {
                foreignKey: 'chat_id',
                as: 'messages'
            });
            Chats.hasMany(models.UserChats, {
                foreignKey: 'chat_id',
                as: 'userChats'
            });
        }
    }
    Chats.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        user_1_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_1_type: {
            type: DataTypes.ENUM('user', 'clinic'),
            allowNull: false
        },
        user_2_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_2_type: {
            type: DataTypes.ENUM('user', 'clinic'),
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Chats',
        timestamps: false
    });

    return Chats;
};
