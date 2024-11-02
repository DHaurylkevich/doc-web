const ServiceService = require("../services/serviceService");

const ServiceController = {
    createService: async (req, res, next) => {
        const { clinicId } = req.params;
        const { name, specialtyId, price } = req.body;
        try {
            const service = await ServiceService.createService(clinicId, name, specialtyId, price );
            res.status(201).json(service);
        } catch (err) {
            console.log(err);
            next(err);
        }
    },
    getService: async (req, res, next) => {
        const { id } = req.params;

        try {
            const service = await ServiceService.getServiceById(id);
            res.status(200).json(service)
        } catch (err) {
            next(err);
        }
    },
    getAllServices: async (req, res, next) => {
        try {
            const service = await ServiceService.getAllServices();
            res.status(200).json(service)
        } catch (err) {
            next(err);
        }
    },
    updateService: async (req, res, next) => {
        const { id } = req.params;
        const { serviceData } = req.body;

        try {
            const updateService = await ServiceService.updateSpecialty(id, serviceData);

            res.status(200).json(updateService);
        } catch (err) {
            next(err);
        }
    },
    deleteService: async (req, res, next) => {
        const { id } = req.params;

        try {
            await ServiceService.deleteService(id);
            res.status(200).json({ message: "Successful delete" });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = ServiceController;