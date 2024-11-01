const db = require("../models");

const DoctorServiceService = {
    assignServiceToDoctor: async (doctorId, specialtyId, t) => {
        try {
            const doctor = await db.Doctors.findByPk(doctorId);
            if (!doctor) {
                throw new Error(`Doctor with ID ${doctorId} not found`);
            }

            await doctor.addSpecialties(specialtyId, { transaction: t });
            return doctor;
        } catch (err) {
            console.error("SpecialtyToDoctor Error", err);
            throw new Error(err);
        }
    },
    getServicesByDoctor: async (doctorId) => {
        try {
            return await db.DoctorSpecialty.findAll({
                where: { doctor_id: doctorId },
                include: [{ model: db.Specialty, as: 'specialty' }]
            });
        } catch (err) {
            console.error("SpecialtyToDoctor Error", err);
            throw new Error(err);
        }
    },
    updateServiceDoctor: async (SpecialtyDoctorId) => {
        try {
            if (!address) {
                throw new Error("Address not found");
            }

            return await db.DoctorSpecialty.update(SpecialtyDoctorId)
        } catch (err) {
            console.error("Error occurred", err);
            throw new Error(err);
        }
    }
}

module.exports = DoctorServiceService;