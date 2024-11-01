'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Services extends Model {
        static associate(models) {
            Services.belongsTo(models.Clinics, {
                foreignKey: 'clinic_id',
                as: 'clinic',
            });
            Services.belongsTo(models.Specialties, {
                foreignKey: 'specialties_id',
                as: 'specialty',
            });
            Services.belongsToMany(models.Doctors, {
                through: models.DoctorService,
                foreignKey: 'service_id',
                otherKey: 'doctor_id',
                as: 'doctors',
            });
        }
    }
    Services.init({
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Services',
    });
    return Services;
};