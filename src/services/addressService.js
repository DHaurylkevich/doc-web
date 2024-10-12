const db = require("../models");
const Address = db.Addresses;

const AddressService = {
    createAddress: async (addressData, t) => {
        try {
            return await Address.create(addressData, { transaction: t })
        } catch (err) {
            console.error("Error occurred", err);
            throw new Error(err.message);
        }
    },
    updateAddress: async (id, addressData, t) => {
        try {
            const address = await Address.findByPk(id);
            if(!address) {
                throw new Error("Address not found");
            }
            
            return await address.update(addressData, { transaction: t })
        } catch (err) {
            console.error("Error occurred", err);
            throw new Error(err.message);
        }
    }
}

module.exports = AddressService;