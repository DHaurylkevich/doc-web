const models = require("../models");
const Address = models.patients;

const AddressService = {
    createAddress: async (addressData, t) => {
        try {
            const createdAddress =  await Address.create(addressData,  { transaction: t })
        } catch (err) {
            console.error("Error occurred", err);
            throw new Error(err.message);
        }
    },
    updateAddress: async () => {}
}

module.exports = AddressService;