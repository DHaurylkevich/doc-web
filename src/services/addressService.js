const db = require("../models");
const AppError = require("../utils/appError");

const AddressService = {
    createAddress: async (addressData, t) => {
        try {
            return await db.Address.create(addressData, { transaction: t });
        } catch (err) {
            throw err;
        }
    },
    updateAddress: async (address, addressData, t) => {
        try {
            if (!address) {
                throw new AppError("Address not found");
            }

            return await address.update(addressData, { transaction: t })
        } catch (err) {
            throw err;
        }
    }
}

module.exports = AddressService;