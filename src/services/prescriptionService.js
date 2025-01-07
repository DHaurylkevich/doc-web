const AppError = require("../utils/appError");
const db = require("../models");
const moment = require("moment");
const { getPaginationParams, getTotalPages } = require("../utils/pagination");

const prescriptionService = {
    createPrescription: async (patientId, doctorId, medicationsIds, expirationDate) => {
        const t = await db.sequelize.transaction();
        try {
            const patient = await db.Patients.findByPk(patientId);
            const medication = await db.Medications.findAll({ where: { id: medicationsIds } });

            if (!patient || medication.length !== medicationsIds.length) {
                throw new AppError("Patient or medication not found", 404);
            }

            const maxExpirationDate = moment().add(360, 'days').toDate();
            if (new Date(expirationDate) > maxExpirationDate) {
                throw new AppError("Expiration date cannot exceed 360 days from today", 400);
            }
            
            const prescriptions = await db.Prescriptions.create({
                patient_id: patientId,
                doctor_id: doctorId,
                expiration_date: expirationDate,
            }, { transaction: t });

            await prescriptions.setMedications(medicationsIds, { transaction: t });

            await t.commit();
            return;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    },
    getPrescriptionsByPatient: async ({ patientId, sort, limit, page }) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);

        try {
            const { rows, count } = await db.Prescriptions.findAndCountAll({
                where: { patient_id: patientId },
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
                    { model: db.Medications, as: "medications", through: { attributes: [] }, attributes: ["name"] },
                ],
            });

            const totalPages = getTotalPages(count, parsedLimit, page);

            return { pages: totalPages, prescriptions: rows };
        } catch (err) {
            throw err;
        }
    },
    getPrescriptionsByDoctor: async ({ doctorId, sort, limit, page }) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);

        try {
            const { rows, count } = await db.Prescriptions.findAndCountAll({
                where: { doctor_id: doctorId },
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
                    { model: db.Medications, as: "medications", through: { attributes: [] }, attributes: ["name"] },
                ],
            });

            const totalPages = getTotalPages(count, parsedLimit, page);

            return { pages: totalPages, prescriptions: rows };
        } catch (err) {
            throw err;
        }
    },
};

module.exports = prescriptionService;
