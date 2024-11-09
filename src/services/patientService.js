const sequelize = require("../config/db");
const db = require("../models");
const UserService = require("../services/userService");
const AddressService = require("../services/addressService");
const authMiddleware = require("../middleware/auth");
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
                throw new Error("User already exist");
            }

            const hashedPassword = await passwordUtil.hashingPassword(userData.password);

            const createdUser = await db.Users.create({
                ...filter,
                password: hashedPassword,
                role: "patient",
            });
            // const createdUser = await db.Users.create(
            //     {
            //         ...userData,
            //         address: addressData
            //     },
            //     {
            //         include: [{ model: db.Addresses, as: 'address' }],
            //         transaction: t
            //     }
            // );

            await createdUser.createPatient(patientData, { transaction: t });

            // await createdPatient.createAddress(addressData, { transaction: t });

            await t.commit();
            return authMiddleware.createJWT(createdUser.id, createdUser.role);
        } catch (err) {
            await t.rollback();
            console.error("Error occurred", err);
            throw err;
        }
    },
    getPatientsByParam: async (sort, limit, offset, clinicId, doctorId) => {
        try {
            const whereConditions = {};
            if (doctorId) whereConditions.doctor_id = doctorId;
            if (clinicId) whereConditions.clinic_id = clinicId;

            const appointments = await db.Appointments.findAll({
                where: whereConditions,
                order: [['createdAt', sort === 'asc' ? 'ASC' : 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                include: [
                    {
                        model: db.Patients,
                        attributes: ['id'],
                        include: [
                            {
                                model: db.Users, attributes: ['id', 'first_name', 'last_name', 'photo', 'gender'],
                                include: [{ model: db.Addresses, as: 'address' }],
                            }
                        ]
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
                        where: { id: userId },
                        include: [{ model: db.Addresses, as: 'address' }],
                    }
                ]
            });

            if (!patient) {
                throw new Error("Patient not found");
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
    updatePatient: async (userId, userData, patientData, addressData) => {
        const t = await sequelize.transaction();

        try {
            const user = await UserService.updateUser(userId, userData, t);

            const patient = await user.getPatient();
            if (!patient) {
                throw new Error("Patient not found");
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
            console.error("Error occurred", err);
            throw err;
        }
    },
};

module.exports = PatientService;