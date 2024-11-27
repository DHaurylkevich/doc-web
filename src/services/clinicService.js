const sequelize = require("../config/db");
const db = require("../models");
const AppError = require("../utils/appError");
const AddressService = require("./addressService");
const passwordUtil = require("../utils/passwordUtil");
const createJWT = require("../utils/createJWT");
const { setPasswordMail } = require("../utils/mail");

const ClinicService = {
    createClinic: async (clinicData, addressData) => {
        const t = await sequelize.transaction();
        clinicData.password = await passwordUtil.hashingPassword(clinicData.password);

        try {
            const clinic = await db.Clinics.create(clinicData, { transaction: t });
            await clinic.createAddress(addressData, { transaction: t });

            const resetToken = createJWT(clinic.id, clinic.role);
            await clinic.update({ resetToken }, { transaction: t });
            setPasswordMail(clinic.email, resetToken);

            await t.commit();
            await clinic.reload({
                include: [{
                    model: db.Addresses,
                    as: 'address',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                }]
            });
            return clinic.get({ plain: true });
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getClinicById: async (clinicId) => {
        try {
            const clinic = await db.Clinics.findByPk(clinicId);
            if (!clinic) {
                throw new AppError("Clinic not found", 404);
            }
            return clinic;
        } catch (err) {
            throw err;
        }
    },
    getFullClinicById: async (clinicId) => {
        try {
            const clinic = await db.Clinics.findOne({
                where: { id: clinicId },
                attributes: { exclude: ['password', 'resetToken', "createdAt", "updatedAt"] },
                include: [{
                    model: db.Addresses,
                    as: "address",
                    attributes: { exclude: ['createdAt', 'updatedAt', 'user_id', 'clinic_id'] }
                }]
            });
            if (!clinic) {
                throw new AppError("Clinic not found", 404);
            }
            return clinic;
        } catch (err) {
            throw err;
        }
    },
    getAllClinicsFullData: async (filters) => {
        try {
            const query = {};
            if (filters.name) query.name = filters.name;
            if (filters.province) query.province = filters.province;

            const queryAddress = {};
            if (filters.city) queryAddress.city = filters.city;

            const querySpecialty = {};
            if (filters.specialty) querySpecialty.specialty = filters.specialty;

            const clinics = await db.Clinics.findAll({
                where: query,
                include: [
                    {
                        model: db.Addresses,
                        as: "address",
                        ...(Object.keys(queryAddress).length > 0 && { where: queryAddress }),
                    },
                    {
                        model: db.Services,
                        as: "services",
                        include: [
                            {
                                model: db.Specialties,
                                as: "specialty",
                                where: querySpecialty
                            }
                        ]
                    }
                ]
            });

            return clinics;
        } catch (err) {
            throw err;
        }
    },
    updateClinic: async (clinicId, clinicData, addressData) => {
        const t = await sequelize.transaction();
        try {
            const clinic = await db.Clinics.findByPk(clinicId);
            if (!clinic) {
                throw new AppError("Clinics not found", 404);
            }
            await clinic.update(clinicData, { transaction: t });

            const address = await clinic.getAddress();
            await AddressService.updateAddress(address, addressData, t)

            await t.commit();
            await clinic.reload({
                include: [{
                    model: db.Addresses,
                    as: 'address',
                    attributes: { exclude: ['createdAt', 'updatedAt', "clinic_id", "user_id"] }
                }]
            });

            const plainClinic = clinic.get({ plain: true });
            const { schedule, resetToken, createdAt, updatedAt, password, ...filteredClinic } = plainClinic;
            return filteredClinic;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    deleteClinicById: async (clinicId) => {
        try {
            const clinic = await db.Clinics.findByPk(clinicId);
            if (!clinic) {
                throw new AppError("Clinic not found", 404);
            }

            await clinic.destroy();
            return;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = ClinicService;