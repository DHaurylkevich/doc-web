const db = require("../models");

const ServiceService = {
    createService: async (clinicId, name, specialtyId, price) => {
        try {
            // Проверка существования клиники
            // Проверка существования специальности

            const service = await db.Services.create({ name, price, clinic_id: clinicId, specialty_id: specialtyId });
            return service
        } catch (err) {
            throw err;
        }
    },
    getAllServices: async () => {
        try {
            const service = await db.Services.findAll();
            if (!service) {
                throw new Error("Specialties not found");
            }

            return service;
        } catch (err) {
            throw err;
        }
    },
    getServiceById: async (id) => {
        try {
            const service = await db.Services.findByPk(id);
            if (!service) {
                throw new Error("Specialty not found");
            }

            return service;
        } catch (err) {
            throw err;
        }
    },
    updateSpecialty: async (id, data) => {
        try {
            let service = await db.Services.findByPk(id);
            if (!service) {
                throw new Error("Schedule not found");
            }

            service = await service.update(data);

            return service;
        } catch (err) {
            throw err;
        }
    },
    deleteService: async (id) => {
        try {
            let service = await db.Services.findByPk(id);
            if (!service) {
                throw new Error("Schedule not found");
            }

            await service.destroy();
        } catch (err) {
            throw err;
        }
    }
}

module.exports = ServiceService;