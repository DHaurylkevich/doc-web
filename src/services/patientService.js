const sequelize = require("../config/db");
const db = require("../models");
const AppError = require("../utils/appError");
const UserService = require("../services/userService");
const AddressService = require("../services/addressService");
const passwordUtil = require("../utils/passwordUtil");

const PatientService = {
    createPatient: async (userData) => {
        const t = await sequelize.transaction();
        try {
            const filter = {};
            if (userData.email) {
                filter.email = userData.email;
            } else {
                throw new AppError("Need to enter the email");
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
                { transaction: t }
            );

            await createdUser.createPatient({}, { transaction: t });

            await t.commit();

            return createdUser;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getPatientById: async (patientId) => {
        try {
            const patient = await db.Patients.findByPk(patientId, {
                attributes: [],
                include: [
                    {
                        model: db.Users,
                        attributes: ["first_name", "last_name", "photo", "phone", "email", "birthday", "gender"],
                        as: "user",
                        include: [
                            {
                                model: db.Addresses,
                                as: "address",
                                attributes: ["city", "home", "street", "flat"],
                            }],
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
    getPatientsByParam: async ({ sort, limit, page, doctorId, clinicId }) => {
        if (!doctorId && !clinicId) {
            throw new AppError("Either doctorId or clinicId is required");
        }

        const sortOptions = [
            [{ model: db.Users, as: "user" }, "first_name", sort === "ASC" ? "ASC" : "DESC"],
        ];

        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;

        try {
            const { rows, count } = await db.Appointments.findAndCountAll({
                limit: parsedLimit,
                offset: offset,
                where: clinicId ? { clinic_id: clinicId } : {},
                attributes: ["id"],
                order: sortOptions,
                include: [
                    {
                        model: db.Patients,
                        as: "patient",
                        order: [["first_name", sort === "asc" ? "ASC" : "DESC"]],
                        attributes: ["id"],
                        include: [
                            {
                                model: db.Users,
                                as: "user",
                                attributes: ["id", "first_name", "last_name", "photo", "gender"],
                                include: [{ model: db.Addresses, as: "address" }],
                            }
                        ]
                    },
                    {
                        model: db.DoctorService,
                        as: "doctorService",
                        attributes: ["doctor_id"],
                        where: doctorId ? { doctor_id: doctorId } : {}
                    }
                ]
            });

            const totalPages = Math.ceil(count / parsedLimit);
            if (page - 1 > totalPages) {
                throw new AppError("Page not found", 404);
            }

            if (!rows.length) {
                return [];
            }

            return { pages: totalPages, patients: rows };
        } catch (err) {
            throw err;
        }
    },
    getAllPatientsForAdmin: async ({ sort, gender, limit, page }) => {
        const userWhere = gender ? { gender } : {};

        const sortOptions = [
            [{ model: db.Users, as: "user" }, "first_name", sort === "ASC" ? "ASC" : "DESC"],
        ];

        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;

        try {
            const { rows, count } = await db.Patients.findAndCountAll({
                limit: parsedLimit,
                offset: offset,
                attributes: [],
                include: [
                    {
                        model: db.Users,
                        as: "user",
                        where: userWhere,
                        attributes: ["first_name", "last_name", "gender", "createdAt", "birthday"]
                    },
                ],
                order: sortOptions
            });

            const totalPages = Math.ceil(count / parsedLimit);
            if (page - 1 > totalPages) {
                throw new AppError("Page not found", 404);
            }

            if (!rows.length) {
                return [];
            }

            return { pages: totalPages, patients: rows };
        } catch (err) {
            throw err;
        }
    }
};

module.exports = PatientService;