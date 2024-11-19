'use strict';
const { Model } = require('sequelize');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
    class Prescriptions extends Model {
        static associate(models) {
            Prescriptions.belongsTo(models.Patients, {
                foreignKey: 'patient_id',
                as: 'patient',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
            Prescriptions.belongsTo(models.Doctors, {
                foreignKey: 'doctor_id',
                as: 'doctor',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
            Prescriptions.belongsTo(models.Medications, {
                foreignKey: 'medication_id',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                as: 'medications',
            });
        }
    }
    Prescriptions.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            defaultValue: () => crypto.randomBytes(6).toString('hex'),
        },
        expiration_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'Prescriptions',
        timestamps: true,
    });
    return Prescriptions;
};
