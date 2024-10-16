// const TEST = require("../../tests/unit/services/clinicService.test");
const sequelize = require("../config/db");
const db = require("../models");
const AddressService = require("./addressService");

const ClinicService = {
    createClinic: async (clientData, addressData) => {
        const t = await sequelize.transaction();

        try {
            const clinic = await db.Clinics.create(clientData, { transaction: t });
            const address = await clinic.createAddress(addressData, { transaction: t });

            await t.commit();
            return clinic;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    findById: async () => {
    },
}

module.exports = ClinicService;