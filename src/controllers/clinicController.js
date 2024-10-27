// const TEST = require("../../tests/unit/controllers/patientController.test.js");
const ClinicService = require("../services/clinicService");

const ClinicController = {
    /**
     *  Создает клинику
     * @param {Object} clinicData 
     * @param {Object} addressData
     * @param {*} next 
     */
    createClinic: async (req, res, next) => {
        const { clinicData, addressData } = req.body;

        try {
            const createdClinic = await ClinicService.createClinic(clinicData, addressData);
            res.status(201).json(createdClinic);
        } catch (err) {
            next(err);
        }
    },
    getClinic: async (req, res, next) => {
        const { id } = req.params;
        try {
            const clinicData = await ClinicService.getClinicById(id);

            res.status(200).json(clinicData);
        } catch (err) {
            next(err);
        }
    },
    getFullClinic: async (req, res, next) => {
        const { id } = req.params;
        try {
            const clinicData = await ClinicService.getFullClinicById(id);

            res.status(200).json(clinicData);
        } catch (err) {
            next(err);
        }
    },
    /**
    * Обновление данных доктора
    * @param {*} req praram{ id }, body{ clinicData, addressData }
    * @param {*} res 
    * @param {*} next 
    */
    updateClinicById: async (req, res, next) => {
        const { id } = req.params;
        const { clinicData, addressData } = req.body;

        try {
            const updatedClinic = await ClinicService.updateClinic(id, clinicData, addressData);

            res.status(200).json(updatedClinic);
        } catch (err) {
            next(err);
        }
    },
    deleteClinic: async (req, res, next) => {
        const { id } = req.params;

        try {
            await ClinicService.deleteClinicById(id);

            res.status(200).json({ message: "Successful delete" })
        } catch (err) {
            next(err);
        }
    }
};

module.exports = ClinicController;