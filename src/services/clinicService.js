// const TEST = require("../../tests/unit/services/clinicService.test");
const sequelize = require("../config/db");
const db = require("../models");
const AddressService = require("./addressService");

const ClinicService = {
    createClinic: async (clinicData, addressData) => {
        const t = await sequelize.transaction();

        try {
            const clinic = await db.Clinics.create(clinicData, { transaction: t });
            await clinic.createAddress(addressData, { transaction: t });

            await t.commit();
            return clinic;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getClinicById: async (id) => {
        try {
            const clinic = await db.Clinics.findByPk(id);
            if (!clinic) {
                throw new Error("Clinic not found");
            }
            return clinic;
        } catch (err) {
            throw err;
        }
    },
    getFullClinicDataById: async (id) => {
        try {
            const clinic = await db.Clinics.findOne({
                where: { id: id },
                include: [db.Addresses]
            });
            if (!clinic) {
                throw new Error("Clinic not found");
            }
            return clinic;
        } catch (err) {
            throw err;
        }
    },
    getAllClinicsFullData: async () => {
        try {
            const clinics = await db.Clinics.findAll({
                include: [db.Addresses]
            });
            if (!clinics) {
                throw new Error("Clinics not found");
            }
            return clinics;
        } catch (err) {
            throw err;
        }
    },
    updateClinic: async (id, clinicData, addressData) => {
        const t = await sequelize.transaction();
        try {
            const clinic = await db.Clinics.findByPk(id)
            if (!clinic) {
                throw new Error("Clinics not found");
            }
            await clinic.updateClinics(clinicData, { transaction: t });
    
            const address = await clinic.getAddresses();
            await AddressService.updateAddress(address, addressData, t)
    
            await t.commit();
            return clinic;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
}

module.exports = ClinicService;