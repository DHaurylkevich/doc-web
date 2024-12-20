const db = require("../models");
const sequelize = require("../config/db");
const AppError = require("../utils/appError");
const AddressService = require("./addressService");
const passwordUtil = require("../utils/passwordUtil");
const createJWT = require("../utils/createJWT");
const { setPasswordMail } = require("../utils/mail");
const TimetableService = require("./timetableService");
const { Op } = require("sequelize");

const ClinicService = {
    createClinic: async (clinicData, addressData) => {
        const t = await sequelize.transaction();
        clinicData.password = await passwordUtil.hashingPassword(clinicData.password);

        try {
            let clinic = await db.Clinics.findAll({
                where: {
                    [Op.or]: [
                        clinicData.email && { email: clinicData.email },
                        clinicData.phone && { phone: clinicData.phone },
                        clinicData.pesel && { pesel: clinicData.pesel },
                        clinicData.name && { name: clinicData.name },
                        clinicData.nip && { nip: clinicData.nip },
                        clinicData.nr_license && { nr_license: clinicData.nr_license },
                    ]
                },
                transaction: t
            });

            if (clinic.length > 0) {
                throw new AppError("Clinic already exist", 400);
            }

            clinic = await db.Clinics.create(clinicData, { transaction: t });
            await clinic.createAddress(addressData, { transaction: t });
            await TimetableService.createTimetable(clinicData.id, t);

            const resetToken = createJWT(clinic.id, clinic.role);
            await clinic.update({ resetToken }, { transaction: t });
            setPasswordMail(clinic.email, resetToken);

            await t.commit();
            return;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getClinicById: async (clinicId) => {
        try {
            const clinic = await db.Clinics.findByPk(clinicId,
                {
                    attributes: { exclude: ["password", "createdAt", "updatedAt", "resetToken", "role", "feedbackRating"] },
                    include: [{
                        model: db.Addresses,
                        as: "address",
                        attributes: { exclude: ["id", "createdAt", "updatedAt", "clinic_id", "user_id"] }
                    }]
                }
            );
            if (!clinic) {
                throw new AppError("Clinic not found", 404);
            }
            return clinic;
        } catch (err) {
            throw err;
        }
    },
    getFullClinicById: async (clinicId) => {
        try {
            const clinic = await db.Clinics.findOne({
                where: { id: clinicId },
                attributes: { exclude: ["password", "resetToken", "createdAt", "updatedAt", "feedbackRating"] },
                include: [
                    {
                        model: db.Addresses,
                        as: "address",
                        attributes: { exclude: ["createdAt", "updatedAt", "user_id", "clinic_id"] }
                    },
                    {
                        model: db.Timetables,
                        as: "timetables",
                        attributes: { exclude: ["createdAt", "updatedAt", "clinic_id"] }
                    },
                ]
            });
            if (!clinic) {
                throw new AppError("Clinic not found", 404);
            }
            return clinic;
        } catch (err) {
            throw err;
        }
    },
    getAllClinicsFullData: async ({ name, province, specialty, city, limit, page }) => {
        const queryClinic = name ? { name } : {};
        const queryAddress = {};
        if (city) queryAddress.city = city;
        if (province) queryAddress.province = province;
        const querySpecialty = specialty ? { name: specialty } : {};

        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;

        try {
            const { rows, count } = await db.Clinics.findAndCountAll({
                raw: true,
                nest: true,
                limit: parsedLimit,
                offset: offset,
                where: queryClinic,
                attributes: {
                    exclude: ["password", "resetToken", "createdAt", "updatedAt", "role", "feedbackRating"],
                    include: [
                        [
                            sequelize.literal(`(
                                SELECT COALESCE(ROUND(CAST(AVG(d.rating) AS NUMERIC), 1), 0)
                                FROM "doctors" d
                                WHERE d.clinic_id = "Clinics".id
                            )`),
                            'averageRating'
                        ],
                        [
                            sequelize.literal(`(
                                SELECT COUNT(d.rating)
                                FROM "doctors" d
                                WHERE d.clinic_id = "Clinics".id
                                AND d.rating IS NOT NULL
                            )`),
                            'totalRatings'
                        ]
                    ]
                },
                include: [
                    {
                        model: db.Addresses,
                        as: "address",
                        attributes: {
                            exclude: ["id", "user_id", "clinic_id", "createdAt", "updatedAt"],
                        },
                        where: queryAddress,
                    },
                    {
                        model: db.Services,
                        as: "services",
                        attributes: {
                            exclude: ["id", "specialty_id", "clinic_id", "createdAt", "updatedAt"],
                        },
                        include: [
                            {
                                model: db.Specialties,
                                as: "specialty",
                                attributes: {
                                    exclude: ["id", , "createdAt", "updatedAt"],
                                },
                                where: querySpecialty
                            }
                        ]
                    },
                ],
            });
            const totalPages = Math.ceil(count / parsedLimit);
            if (page - 1 > totalPages) {
                throw new AppError("Page not found", 404);
            }

            if (!rows.length) {
                return [];
            }

            return {
                pages: totalPages,
                clinics: rows.map(clinic => ({
                    ...clinic,
                    averageRating: parseFloat(clinic.averageRating),
                    totalRatings: clinic.totalRatings
                }))
            };
        } catch (err) {
            throw err;
        }
    },
    getAllClinicsForAdmin: async ({ sort, limit, page }) => {
        const sortOptions = [
            ["name", sort === "ASC" ? "ASC" : "DESC"],
        ];

        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;

        try {
            const { rows, count } = await db.Clinics.findAndCountAll({
                limit: parsedLimit,
                offset: offset,
                order: sortOptions,
                attributes: {
                    exclude: ["password", "resetToken", "updatedAt", "role", "description", "feedbackRating"],
                    include: [
                        [
                            sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM "doctors" AS doctors
                                WHERE doctors.clinic_id = "Clinics".id
                            )`),
                            'doctorCount'
                        ]
                    ]
                },
                include: [
                    {
                        model: db.Addresses,
                        as: "address",
                        attributes: {
                            exclude: ["id", "user_id", "clinic_id", "createdAt", "updatedAt"],
                        }
                    },
                    {
                        model: db.Timetables,
                        as: "timetables",
                        attributes: {
                            exclude: ["id", "clinic_id", "createdAt", "updatedAt"],
                        }
                    }
                ],
            });

            const totalPages = Math.ceil(count / parsedLimit);
            if (page - 1 > totalPages) {
                throw new AppError("Page not found", 404);
            }

            if (!rows.length) {
                return [];
            }

            return { pages: totalPages, clinics: rows };
        } catch (err) {
            throw err;
        }
    },
    updateClinic: async (clinicId, clinicData, addressData) => {
        const t = await sequelize.transaction();
        try {
            const clinic = await db.Clinics.findByPk(clinicId);
            await clinic.update(clinicData, { transaction: t });

            const address = await clinic.getAddress();
            await AddressService.updateAddress(address, addressData, t)

            await t.commit();
            await clinic.reload({
                include: [{
                    model: db.Addresses,
                    as: "address",
                    attributes: { exclude: ["createdAt", "updatedAt", "clinic_id", "user_id"] }
                }]
            });

            const plainClinic = clinic.get({ plain: true });
            const { schedule, resetToken, createdAt, updatedAt, password, ...filteredClinic } = plainClinic;
            return filteredClinic;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    deleteClinicById: async (clinicId) => {
        try {
            await db.Clinics.destroy({
                where: { id: clinicId }
            });
            return;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = ClinicService;