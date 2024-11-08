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
        const { clinicId } = req.params;
        try {
            const clinicData = await ClinicService.getClinicById(clinicId);

            res.status(200).json(clinicData);
        } catch (err) {
            next(err);
        }
    },
    getAllClinicByParams: async (req, res, next) => {
        const { name, province, specialty, city } = req.query;
        try {
            const clinicData = await ClinicService.getAllClinicsFullData({name, province, specialty, city});

            res.status(200).json(clinicData);
        } catch (err) {
            console.log(err);
            next(err);
        }
    },
    getFullClinic: async (req, res, next) => {
        const { clinicId } = req.params;
        try {
            const clinicData = await ClinicService.getFullClinicById(clinicId);

            res.status(200).json(clinicData);
        } catch (err) {
            console.log(err);
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
        const { clinicId } = req.params;
        const { clinicData, addressData } = req.body;

        try {
            const updatedClinic = await ClinicService.updateClinic(clinicId, clinicData, addressData);

            res.status(200).json(updatedClinic);
        } catch (err) {
            console.log(err);
            next(err);
        }
    },
    deleteClinic: async (req, res, next) => {
        const { clinicId } = req.params;

        try {
            await ClinicService.deleteClinicById(clinicId);

            res.status(200).json({ message: "Successful delete" })
        } catch (err) {
            next(err);
        }
    }
};

module.exports = ClinicController;