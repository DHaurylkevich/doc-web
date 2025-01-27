const ClinicService = require("../services/clinicService");

const ClinicController = {
    createClinic: async (req, res, next) => {
        const { clinicData, addressData } = req.body;

        try {
            const createdClinic = await ClinicService.createClinic(clinicData, addressData);

            res.status(201).json(createdClinic);
        } catch (err) {
            next(err);
        }
    },
    getFullClinic: async (req, res, next) => {
        const { clinicId } = req.params;
        try {
            const clinicData = await ClinicService.getFullClinicById(clinicId);

            res.status(200).json(clinicData);
        } catch (err) {
            next(err);
        }
    },
    getAllClinicByParams: async (req, res, next) => {
        const { name, province, specialty, city, limit, page } = req.query;

        try {
            const clinicData = await ClinicService.getAllClinicsFullData({ name, province, specialty, city, limit, page });

            res.status(200).json(clinicData);
        } catch (err) {
            next(err);
        }
    },
    getAllClinicsForAdmin: async (req, res, next) => {
        const { sort, limit, page } = req.query;

        try {
            const clinics = await ClinicService.getAllClinicsForAdmin({ sort, limit, page });

            res.status(200).json(clinics);
        } catch (err) {
            next(err);
        }
    },
    getAllCities: async (req, res, next) => {
        try {
            const cities = await ClinicService.getAllCities();
            res.json(cities);
        } catch (error) {
            next(error);
        }
    },
    updateClinicById: async (req, res, next) => {
        const clinicId = req.user.id;
        const { clinicData, addressData } = req.body;

        try {
            const updatedClinic = await ClinicService.updateClinic(clinicId, clinicData, addressData);

            res.status(200).json(updatedClinic);
        } catch (err) {
            next(err);
        }
    }
};

module.exports = ClinicController;