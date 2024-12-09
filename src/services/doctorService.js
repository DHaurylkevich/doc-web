const sequelize = require("../config/db");
const AppError = require("../utils/appError");
const db = require("../models");
const UserService = require("../services/userService");
const ClinicService = require("./clinicService");
const { Op } = require("sequelize");
const createJWT = require("../utils/createJWT");
const { setPasswordMail } = require("../utils/mail");

const DoctorService = {
    createDoctor: async ({ clinicId, userData, addressData, doctorData, specialtyId, servicesIds }) => {
        const t = await sequelize.transaction();

        try {
            await ClinicService.getClinicById(clinicId);

            const foundUser = await db.Users.findOne({
                where: {
                    [Op.or]: [
                        userData.email && { email: userData.email },
                        userData.phone && { phone: userData.phone },
                        userData.pesel && { pesel: userData.pesel },
                    ].filter(Boolean)
                }
            });

            if (foundUser) {
                throw new AppError("User already exist", 400);
            }

            const createdUser = await db.Users.create(
                {
                    ...userData,
                    role: "doctor",
                    address: addressData
                },
                {
                    include: [{ model: db.Addresses, as: 'address' }],
                    transaction: t
                }
            );

            const createdDoctor = await createdUser.createDoctor(
                {
                    clinic_id: clinicId,
                    ...doctorData,
                    specialty_id: specialtyId
                },
                { transaction: t }
            );

            const resetToken = createJWT(createdUser.id, createdUser.role);
            await createdUser.update({ resetToken }, { transaction: t });

            createdDoctor.specialties_id = specialtyId;
            if (servicesIds && servicesIds.length) {
                await createdDoctor.setServices(servicesIds, { transaction: t });
            }

            await t.commit();
            await setPasswordMail(createdUser.email, resetToken);
            return;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getDoctorById: async (doctorId) => {
        try {
            const doctor = await db.Doctors.findOne({
                where: { id: doctorId },
                attributes: ["id", "description", "rating", "hired_at"],
                include: [
                    {
                        model: db.Users,
                        as: "user",
                        attributes: ["first_name", "last_name", "gender", "photo", "email"],
                        include: [
                            {
                                model: db.Addresses,
                                as: "address"
                            }
                        ],
                    },
                    {
                        model: db.Specialties,
                        as: 'specialty',
                        attributes: ["name"]
                    },
                    {
                        model: db.Clinics,
                        as: 'clinic',
                        attributes: ["name"]
                    }
                ]
            });
            if (!doctor) {
                throw new AppError("Doctor not found", 404);
            }

            return doctor;
        } catch (err) {
            throw err;
        }
    },
    updateDoctorById: async ({ userId, userData, addressData, doctorData, servicesIds }) => {
        const t = await sequelize.transaction();

        try {
            const user = await UserService.updateUser({ userId, updatedData: userData, t });

            const address = await user.getAddress();
            await address.update(addressData, t);

            const doctor = await user.getDoctor();
            if (!doctor) {
                throw new AppError("Doctor not found", 404);
            }
            await doctor.update(doctorData, { transaction: t });

            await doctor.setServices(servicesIds, { transaction: t });

            await t.commit();
            return doctor;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getShortDoctorById: async (doctorId) => {
        try {
            const doctor = await db.Doctors.findByPk(doctorId, {
                attributes: ["id", "description", "rating"],
                include: [
                    {
                        model: db.Users, as: "user",
                        attributes: ["first_name", "last_name", "photo"],
                    },
                    {
                        model: db.Specialties, as: 'specialty',
                        attributes: ["name"]
                    },
                    {
                        model: db.Clinics, as: 'clinic',
                        attributes: [],
                        include: [
                            { model: db.Addresses, as: "address" }
                        ]
                    }
                ],
                raw: true
            });
            if (!doctor) {
                throw new AppError("Doctor not found", 404);
            }
            return doctor;
        } catch (err) {
            throw err;
        }
    },
    getDoctorsByClinicWithSorting: async (clinicId, filters) => {
        try {
            const query = {};
            if (filters.gender) {
                query.gender = filters.gender;
            }

            const sortOptions = [];
            if (filters.sortBy) {
                sortOptions.push({ "$User.name": filters.sort === "desc" ? "DESC" : "ASC" });
            }
            const doctors = await db.Doctors.findAll({
                where: { clinic_id: clinicId },
                attributes: ["id"],
                include: [
                    {
                        model: db.Users,
                        as: "user",
                        where: query,
                        attributes: ["first_name", "last_name", "gender"],
                    },
                    {
                        model: db.Specialties,
                        as: "specialty",
                        attributes: ["name"],
                    }
                ],
                order: sortOptions,
            })
            return doctors;
        } catch (err) {
            throw err;
        }
    },
};

module.exports = DoctorService;