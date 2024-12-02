const db = require("../models");
const ClinicService = require("../services/clinicService");
const SpecialtyService = require("../services/specialtyService");
const AppError = require("../utils/appError");

const ServiceService = {
    createService: async ({ clinicId, name, specialtyId, price }) => {
        try {
            await ClinicService.getClinicById(clinicId);
            await SpecialtyService.getSpecialtyById(specialtyId);

            const serviceExist = await db.Services.findOne({
                where: { name: name, price: price, specialty_id: specialtyId, clinic_id: clinicId }
            });
            if (serviceExist) {
                throw new AppError("Service already exists", 409);
            }

            const service = await db.Services.create({ name, price, clinic_id: clinicId, specialty_id: specialtyId });
            return service
        } catch (err) {
            throw err;
        }
    },
    getAllServices: async () => {
        try {
            const service = await db.Services.findAll();

            return service;
        } catch (err) {
            throw err;
        }
    },
    getServiceById: async (serviceId) => {
        try {
            const service = await db.Services.findByPk(serviceId);
            if (!service) {
                throw new AppError("Service not found", 404);
            }

            return service;
        } catch (err) {
            throw err;
        }
    },
    updateService: async (serviceId, data) => {
        try {
            let service = await db.Services.findByPk(serviceId);
            if (!service) {
                throw new AppError("Service not found", 404);
            }

            service = await service.update(data);

            return service;
        } catch (err) {
            throw err;
        }
    },
    deleteService: async (serviceId) => {
        try {
            let service = await db.Services.findByPk(serviceId);
            if (!service) {
                throw new AppError("Service not found", 404);
            }

            await service.destroy();
        } catch (err) {
            throw err;
        }
    }
};

module.exports = ServiceService;