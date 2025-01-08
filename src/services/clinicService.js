const db = require("../models");
const sequelize = require("../config/db");
const AppError = require("../utils/appError");
const AddressService = require("./addressService");
const hashingPassword = require("../utils/passwordUtil");
const createJWT = require("../utils/createJWT");
const { setPasswordMail } = require("../utils/mail");
const TimetableService = require("./timetableService");
const { getPaginationParams, getTotalPages } = require("../utils/pagination");
const { Op } = require("sequelize");

const ClinicService = {
    createClinic: async (clinicData, addressData) => {
        const t = await sequelize.transaction();
        clinicData.password = await hashingPassword(clinicData.password);

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
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getClinicById: async (clinicId) => {
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
    },
    getFullClinicById: async (clinicId) => {
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
    },
    getAllClinicsFullData: async ({ name, province, specialty, city, limit, page }) => {
        const queryClinic = name ? { name } : {};
        const querySpecialty = specialty ? { name: specialty } : {};

        const queryAddress = {};
        if (city) queryAddress.city = city;
        if (province) queryAddress.province = province;

        const { parsedLimit, offset } = getPaginationParams(limit, page);

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
                                exclude: ["id", "createdAt", "updatedAt"],
                            },
                            where: querySpecialty
                        }
                    ]
                },
            ],
        });

        const totalPages = getTotalPages(count, parsedLimit, page);

        if (!rows.length) {
            return { pages: 0, clinics: [] };
        }

        return {
            pages: totalPages,
            clinics: rows.map(clinic => ({
                ...clinic,
                averageRating: parseFloat(clinic.averageRating),
                totalRatings: clinic.totalRatings
            }))
        };
    },
    getAllClinicsForAdmin: async ({ sort, limit, page }) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);

        const { rows, count } = await db.Clinics.findAndCountAll({
            limit: parsedLimit,
            offset: offset,
            order: ["name", sort === "ASC" ? "ASC" : "DESC"],
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

        const totalPages = getTotalPages(count, parsedLimit, page);

        if (!rows.length) {
            return { pages: 0, clinics: [] };
        }

        return { pages: totalPages, clinics: rows };
    },
    updateClinic: async (clinicId, clinicData, addressData) => {
        const t = await sequelize.transaction();

        try {
            const clinic = await db.Clinics.findByPk(clinicId);
            await clinic.update(clinicData, { transaction: t });

            const address = await clinic.getAddress();
            await AddressService.updateAddress(address, addressData, t);

            await t.commit();

            const plainClinic = await clinic.reload({
                include: [{
                    model: db.Addresses,
                    as: "address",
                    attributes: { exclude: ["createdAt", "updatedAt", "clinic_id", "user_id"] }
                }],
                attributes: { exclude: ["schedule", "resetToken", "createdAt", "updatedAt", "password"] }
            });

            return plainClinic;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    deleteClinicById: async (clinicId) => {
        await db.Clinics.destroy({
            where: { id: clinicId }
        });
    },
    getAllCities: async () => {
        const cities = await db.Clinics.findAll({
            attributes: [[sequelize.col("address.city"), "city"]],
            include: [
                {
                    model: db.Addresses,
                    as: "address",
                    attributes: [],
                    where: {
                        city: {
                            [Op.ne]: null
                        }
                    },
                }
            ],
            raw: true,
        });
        return cities.map(city => city.city);
    }
};

module.exports = ClinicService;