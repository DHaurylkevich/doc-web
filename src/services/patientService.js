const sequelize = require("../config/db");
const db = require("../models");
const AppError = require("../utils/appError");
const UserService = require("../services/userService");
const AddressService = require("../services/addressService");
const passwordUtil = require("../utils/passwordUtil");

const PatientService = {
    /**
     * Регистрация пользователя и получение токена
     * @param {Object} userData 
     * @param {Object} patientData 
     * @param {Object} addressData 
     * @returns {String} token
     */
    createPatient: async (userData, patientData) => {
        const t = await sequelize.transaction();
        try {
            const filter = {};
            if (userData.pesel) {
                filter.pesel = userData.pesel;
            } else if (userData.phone) {
                filter.phone = userData.phone;
            } else if (userData.email) {
                filter.email = userData.email;
            } else {
                throw new Error("Необходимо указать хотя бы один идентификатор: pesel, phone или email.");
            }

            const foundUser = await db.Users.findOne({
                where: filter,
                transaction: t
            });
            if (foundUser) {
                throw new AppError("User already exist", 400);
            }

            const hashedPassword = await passwordUtil.hashingPassword(userData.password);

            const createdUser = await db.Users.create({
                ...filter,
                password: hashedPassword,
                role: "patient",
            },
                { transaction: t });

            await createdUser.createPatient(patientData, { transaction: t });

            await t.commit();
            return createdUser;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getPatientsByParam: async ({ sort, limit, offset, doctorId, clinicId }) => {
        try {
            const appointments = await db.Appointments.findAll({
                where: clinicId ? { clinic_id: clinicId } : {},
                order: [['createdAt', sort === 'asc' ? 'ASC' : 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                include: [
                    {
                        model: db.Patients,
                        attributes: ['id'],
                        include: [
                            {
                                model: db.Users,
                                as: "user",
                                attributes: ['id', 'first_name', 'last_name', 'photo', 'gender'],
                                include: [{ model: db.Addresses, as: 'address' }],
                            }
                        ]
                    },
                    {
                        model: db.DoctorService,
                        as: 'doctorService',
                        attributes: ['doctor_id'],
                        where: doctorId ? { doctor_id: doctorId } : {}
                    }
                ]
            });

            return appointments;
        } catch (err) {
            throw err;
        }
    },
    /**
     * Находит Пациента по id
     * @param {Number} id 
     * @returns {Object} Обьект patient
     */
    getPatientById: async (userId) => {
        try {
            const patient = await db.Patients.findOne({
                include: [
                    {
                        model: db.Users,
                        as: "user",
                        where: { id: userId },
                        include: [{ model: db.Addresses, as: 'address' }],
                    }
                ]
            });

            if (!patient) {
                throw new AppError("Patient not found", 404);
            }
            return patient;
        } catch (err) {
            throw err;
        }
    },
    /**
     * 
     * @param {Number} id 
     * @param {Object} userData 
     * @param {Object} patientData 
     * @param {Object} addressData 
     * @returns {Object}
     */
    updatePatient: async (image, userId, userData, patientData, addressData) => {
        const t = await sequelize.transaction();

        try {
            const user = await UserService.updateUser(image, userId, userData, t);

            const patient = await user.getPatient();
            if (!patient) {
                throw new AppError("Patient not found", 404);
            }
            await patient.update(patientData, { transaction: t });

            const address = await patient.getAddress();
            if (address) {
                await AddressService.updateAddress(address, addressData, t);
            }

            await t.commit();
            return { user, patient, address };
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
};

module.exports = PatientService;