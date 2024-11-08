const sequelize = require("../config/db");
const db = require("../models");
const UserService = require("../services/userService");
const ClinicService = require("./clinicService");
// const ServiceService = require("./serviceService");
// const SpecialtyService = require("./specialtyService");
// const DoctorServiceService = require("./DoctorServiceService");

const DoctorService = {
    /**
     * Регистрация пользователя и получение токена
     * @param {Object} userData 
     * @param {Object} doctorData 
     * @param {Number} specialty_id  //Надо сделать, чтобы получал id
     * @param {Object} clinic_id 
     * @returns {String} token
     */
    createDoctor: async (userData, addressData, doctorData, specialtyId, clinicId, servicesIds) => {
        const t = await sequelize.transaction();
        userData.role = "doctor";
        try {
            await ClinicService.getClinicById(clinicId, { transaction: t });

            const foundUser = await db.Users.findOne({ where: { pesel: userData.pesel } });
            if (foundUser) {
                throw new Error("User already exist");
            }

            const createdUser = await db.Users.create(
                {
                    ...userData,
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

            createdDoctor.specialties_id = specialtyId;
            if (servicesIds && servicesIds.length) {
                await createdDoctor.setServices(servicesIds, { transaction: t });
            }

            await t.commit();
            return createdDoctor;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getDoctorById: async (userId) => {
        try {
            const doctor = await db.Doctors.findOne({
                include: [
                    {
                        model: db.Users,
                        where: { id: userId },
                        as: "user",
                        exclude: ["password"],
                        include: [
                            {
                                model: db.Addresses,
                                as: "address"
                            }
                        ],
                    },
                    {
                        model: db.Specialties, as: 'specialty'
                    },
                ]
            });
            if (!doctor) {
                throw new Error('Doctor not found');
            }
            return doctor;
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
    updateDoctorById: async (userId, userData, addressData, doctorData, servicesIds) => {
        const t = await sequelize.transaction();
        console.log(userId);
        try {
            const user = await UserService.updateUser(userId, userData, t);

            const address = await user.getAddress();
            await address.update(addressData, t);

            const doctor = await user.getDoctor();
            if (!doctor) {
                throw new Error("Doctor not found");
            }
            await doctor.update(doctorData, { transaction: t });

            await doctor.setServices(servicesIds, { transaction: t });

            await t.commit();
            return doctor;
        } catch (err) {
            await t.rollback();
            console.log(err);
            throw err;
        }
    },
    getShortDoctorById: async (doctorId) => {
        try {
            console.log(doctorId);
            const doctor = await db.Doctors.findByPk(doctorId, {
                include: [
                    {
                        model: db.Users, as: "user",
                        attributes: ["id", "first_name", "last_name"],
                    },
                    {
                        model: db.Specialties, as: 'specialty'
                    }
                ]
            });
            if (!doctor) {
                throw new Error('Doctor not found');
            }
            return doctor;
        } catch (err) {
            throw err;
        }
    },
    getDoctorsByClinicWithSorting: async (clinicId, filters) => {
        try {
            // const query = { clinic_id: clinicId };
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