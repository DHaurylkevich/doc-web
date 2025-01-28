const AppError = require("../utils/appError");
const db = require("../models");
const moment = require("moment");
const { getPaginationParams, getTotalPages } = require("../utils/pagination");

const prescriptionService = {
    createPrescription: async (patientId, doctorId, medicationsIds, expirationDate) => {
        const t = await db.sequelize.transaction();

        try {
            const maxExpirationDate = moment().add(360, 'days').toDate();
            if (new Date(expirationDate) > maxExpirationDate || new Date(expirationDate) < moment().toDate()) {
                throw new AppError("Expiration date must be between today and 360 days from today", 400);
            }

            const [patient, medication] = await Promise.all([
                db.Patients.findByPk(patientId),
                db.Medications.findAll({ where: { id: medicationsIds } }),
            ]);

            if (!patient || medication.length !== medicationsIds.length) {
                throw new AppError("Patient or medication not found", 404);
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
    getPrescriptionsByPatient: async (userRole, { roleId, sort, limit, page }) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);

        let wherePrescriptions = {};
        let includeModel = {};
        const excludePrescriptions = ["updatedAt", "doctor_id", "medication_id", "patient_id"];
        switch (userRole) {
            case "patient":
                wherePrescriptions = { patient_id: roleId };
                includeModel = {
                    model: db.Doctors, as: "doctor",
                    attributes: ["id"],
                    include: [
                        {
                            model: db.Users,
                            as: "user",
                            attributes: ["id", "first_name", "last_name"],
                        }
                    ]
                };
                break;
            case "doctor":
                wherePrescriptions = { doctor_id: roleId };
                includeModel = {
                    model: db.Patients, as: "patient",
                    attributes: ["id"],
                    include: [
                        {
                            model: db.Users,
                            as: "user",
                            attributes: ["id", "first_name", "last_name", "photo"],
                        }
                    ]
                };
                excludePrescriptions.push("code");
                break;
        }

        const { rows, count } = await db.Prescriptions.findAndCountAll({
            limit: parsedLimit,
            offset: offset,
            where: wherePrescriptions,
            order: [['createdAt', sort === 'DESC' ? 'DESC' : 'ASC']],
            attributes: { exclude: excludePrescriptions },
            include: [
                includeModel,
                { model: db.Medications, as: "medications", through: { attributes: [] }, attributes: ["name"] },
            ],
        });

        const totalPages = getTotalPages(count, parsedLimit, page);

        const { active, inactive } = rows.reduce((acc, prescription) => {
            if (prescription.status === 'active') {
                acc.active.push(prescription);
            } else {
                acc.inactive.push(prescription);
            }
            return acc;
        }, { active: [], inactive: [] });

        return { pages: totalPages, prescriptions: { active, inactive } };
    }
};

module.exports = prescriptionService;
