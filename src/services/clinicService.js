const sequelize = require("../config/db");
const db = require("../models");
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
                    attributes: { exclude: ["password", "createdAt", "updatedAt", "resetToken", "role"] },
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
                attributes: { exclude: ["password", "resetToken", "createdAt", "updatedAt"] },
                include: [
                    {
                        model: db.Addresses,
                        as: "address",
                        attributes: { exclude: ["createdAt", "updatedAt", "user_id", "clinic_id"] }
                    },
                    {
                        model: db.Timetables,
                        as: "timetable",
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
        const query = {};
        if (name) query.name = name;
        if (province) query.province = province;

        const queryAddress = city ? { city } : {};
        const querySpecialty = specialty ? { name: specialty } : {};

        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;

        try {
            const { rows, count } = await db.Clinics.findAndCountAll({
                limit: parsedLimit,
                offset: offset,
                where: query,
                attributes: {
                    exclude: ["password", "resetToken", "createdAt", "updatedAt", "role"]
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

            return { pages: totalPages, clinics: rows };
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
                    exclude: ["password", "resetToken", "updatedAt", "role", "description"],
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
            if (!clinic) {
                throw new AppError("Clinics not found", 404);
            }
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
            const clinic = await db.Clinics.findByPk(clinicId);
            if (!clinic) {
                throw new AppError("Clinic not found", 404);
            }

            await clinic.destroy();
            return;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = ClinicService;