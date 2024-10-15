// const TEST = require("../../tests/unit/services/addressService.test");
const db = require("../models");
const Address = db.Addresses;

const AddressService = {
    /**
     * 
     * @param {Object} addressData 
     * @param {Sequelize} t 
     * @returns {Object}
     */
    createAddress: async (addressData, t) => {
        try {
            return await Address.create(addressData, { transaction: t });
        } catch (err) {
            console.error("Error occurred", err);
            throw new Error(err.message);
        }
    },
    /**
     * 
     * @param {Number} id 
     * @param {Object} addressData 
     * @param {Sequelize} t 
     * @returns {Object}
     */
    updateAddress: async (address, addressData, t) => {
        try {
            return await address.update(addressData, { transaction: t })
        } catch (err) {
            console.error("Error occurred", err);
            throw new Error(err.message);
        }
    }
}

module.exports = AddressService;