'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Specialties extends Model {
        static associate(models) {
            Specialties.belongsToMany(models.Doctors, {
                through: models.DoctorSpecialty,
                foreignKey: 'specialty_id',
                otherKey: 'doctor_id',
                as: 'doctors',
            });
            // Specialties.belongsToMany(models.Services, {
            //     through: models.SpecialtyService,
            //     foreignKey: 'specialty_id',
            //     otherKey: 'service_id',
            //     as: 'services',
            // });
        }
    }
    Specialties.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: 'Specialties',
    });
    return Specialties;
};