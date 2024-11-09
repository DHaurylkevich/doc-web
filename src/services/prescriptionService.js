// services/prescriptionService.js
const db = require('../models');
const crypto = require('crypto');

const prescriptionService = {
    createPrescription: async (patientId, doctorId, medicationId, expirationDate) => {
        const t = await db.sequelize.transaction();
        try {
            const patient = await db.Patients.findByPk(patientId);
            const doctor = await db.Doctors.findByPk(doctorId);
            const medication = await db.Medications.findByPk(medicationId);

            if (!patient || !doctor || !medication) {
                throw new Error("Пациент, доктор или лекарство не найдены");
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
    getPrescriptionsByPatient: async (patientId) => {
        try {
            const patient = await db.Patients.findByPk(patientId);
            if (patient) {
                throw new Error("Patient not found");
            }

            const prescriptions = await db.Prescriptions.findAll({
                where: { patient_id: patientId },
                include: [
                    {
                        model: db.Doctors, as: 'doctor',
                        attributes: ['id'],
                        include: [
                            {
                                model: db.Users,
                                as: "user",
                                attributes: ['id', 'first_name', 'last_name'],
                            }
                        ]
                    },
                    { model: db.Medications, as: 'medications', attributes: ['id', 'name', 'dosage', 'description'] },
                ],
            });

            return prescriptions;
        } catch (err) {
            throw err;
        }
    },
    getPrescriptionsByDoctor: async (doctorId) => {
        try {
            const doctor = await db.Doctors.findByPk(doctorId);
            if (doctor) {
                throw new Error("Doctor not found");
            }

            const prescriptions = await db.Prescriptions.findAll({
                where: { doctor_id: doctorId },
                include: [
                    {
                        model: db.Patients, as: 'patient',
                        attributes: ['id'],
                        include: [
                            {
                                model: db.Users,
                                as: "user",
                                attributes: ['id', 'first_name', 'last_name'],
                            }
                        ]
                    },
                    { model: db.Medications, as: 'medications', attributes: ['id', 'name'] },
                ],
            });

            return prescriptions;
        } catch (err) {
            throw err;
        }
    },
};

module.exports = prescriptionService;
