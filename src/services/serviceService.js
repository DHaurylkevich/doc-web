const db = require("../models");
const ClinicService = require("../services/clinicService");
const SpecialtyService = require("../services/specialtyService");
const AppError = require("../utils/appError");

const ServiceService = {
    createService: async ({ clinicId, name, specialtyId, price }) => {
        await Promise.all([
            ClinicService.getClinicById(clinicId),
            SpecialtyService.getSpecialtyById(specialtyId)
        ]);

        const serviceExist = await db.Services.findOne({
            where: { name: name, price: price, specialty_id: specialtyId, clinic_id: clinicId }
        });
        if (serviceExist) {
            throw new AppError("Service already exists", 409);
        }

        const service = await db.Services.create({ name, price, clinic_id: clinicId, specialty_id: specialtyId });
        return service;
    },
    getAllServices: async (clinicId) => {
        return await db.Services.findAll(
            {
                where: { clinic_id: clinicId },
                attributes: { exclude: ["createdAt", "updatedAt", "clinic_id"] }
            }
        );
    },
    getServiceById: async (serviceId) => {
        const service = await db.Services.findByPk(serviceId);
        if (!service) {
            throw new AppError("Service not found", 404);
        }

        return service;
    },
    updateService: async (serviceId, data) => {
        let service = await db.Services.findByPk(serviceId);
        if (!service) {
            throw new AppError("Service not found", 404);
        }

        service = await service.update(data);

        return service;
    },
    deleteService: async (serviceId) => {
        const service = await db.Services.findByPk(serviceId);
        if (!service) {
            throw new AppError("Service not found", 404);
        }

        await service.destroy();
    }
};

module.exports = ServiceService;