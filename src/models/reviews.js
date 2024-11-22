'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Reviews extends Model {
        //maybe привязать к Записи, чтобы была конкретика 0_O
        static associate(models) {
            Reviews.belongsTo(models.Patients, {
                foreignKey: 'patient_id',
                as: 'patient',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
            Reviews.belongsTo(models.Doctors, {
                foreignKey: 'doctor_id',
                as: 'doctor',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
            Reviews.belongsToMany(models.Tags, {
                through: 'ReviewTags',
                foreignKey: 'review_id',
                otherKey: 'tag_id',
                as: 'tags',
            });
        }
    }
    Reviews.init({
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'Reviews',
        tableName: 'reviews',
        timestamps: true,
    });
    return Reviews;
};
