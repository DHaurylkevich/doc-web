// services/prescriptionService.js
const db = require("../models");
const AppError = require("../utils/appError");

const prescriptionService = {
    createPrescription: async (patientId, doctorId, medicationId, expirationDate) => {
        const t = await db.sequelize.transaction();
        try {
            const patient = await db.Patients.findByPk(patientId);
            const doctor = await db.Doctors.findByPk(doctorId);
            const medication = await db.Medications.findByPk(medicationId);

            if (!patient || !doctor || !medication) {
                throw new AppError("Пациент, доктор или лекарство не найдены", 404);
            }

            const prescription = await db.Prescriptions.create({
                patient_id: patientId,
                doctor_id: doctorId,
                medication_id: medicationId,
                expiration_date: expirationDate,
            }, { transaction: t });

            await t.commit();
            return prescription;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    },
    getPrescriptionsByPatient: async ({ userId, limit, page }) => {
        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;

        try {
            const patient = await db.Patients.findOne({
                raw: true,
                where: { user_id: userId },
                attributes: ["id"]
            });
            if (!patient) {
                throw new AppError("Patient not found", 404);
            }

            const { rows, count } = await db.Prescriptions.findAndCountAll({
                where: { patient_id: patient.id },
                attributes: { exclude: ["updatedAt", "doctor_id", "medication_id", "patient_id"] },
                limit: parsedLimit,
                offset: offset,
                order: [['createdAt', sort === 'DESC' ? 'DESC' : 'ASC']],
                include: [
                    {
                        model: db.Doctors, as: "doctor",
                        attributes: ["id"],
                        include: [
                            {
                                model: db.Users,
                                as: "user",
                                attributes: ["id", "first_name", "last_name"],
                            }
                        ]
                    },
                    { model: db.Medications, as: "medications", attributes: ["id", "name"] },
                ],
            });

            const totalPages = Math.ceil(count / parsedLimit);
            if (page - 1 > totalPages) {
                throw new AppError("Page not found", 404);
            }

            if (!rows.length) {
                return [];
            }

            return { pages: totalPages, prescriptions: rows };
        } catch (err) {
            throw err;
        }
    },
    getPrescriptionsByDoctor: async ({ userId, sort, limit, page }) => {
        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;

        try {
            const doctor = await db.Doctors.findOne({
                raw: true,
                where: { user_id: userId },
                attributes: ["id"]
            });
            if (!doctor) {
                throw new AppError("Doctor not found", 404);
            }

            const { rows, count } = await db.Prescriptions.findAndCountAll({
                where: { doctor_id: doctor.id },
                order: [['createdAt', sort === 'DESC' ? 'DESC' : 'ASC']],
                limit: parsedLimit,
                offset: offset,
                attributes: { exclude: ["updatedAt", "doctor_id", "medication_id", "patient_id"] },
                include: [
                    {
                        model: db.Patients, as: "patient",
                        attributes: ["id"],
                        include: [
                            {
                                model: db.Users,
                                as: "user",
                                attributes: ["id", "first_name", "last_name", "photo"],
                            }
                        ]
                    },
                    { model: db.Medications, as: "medications", attributes: ["id", "name"] },
                ],
            });

            const totalPages = Math.ceil(count / parsedLimit);
            if (page - 1 > totalPages) {
                throw new AppError("Page not found", 404);
            }

            if (!rows.length) {
                return [];
            }

            return { pages: totalPages, prescriptions: rows };
        } catch (err) {
            throw err;
        }
    },
};

module.exports = prescriptionService;
