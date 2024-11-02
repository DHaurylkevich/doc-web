const sequelize = require("../config/db");
const db = require("../models");
const UserService = require("../services/userService");
const ClinicService = require("./clinicService");
const ServiceService = require("./serviceService");
const SpecialtyService = require("./specialtyService");
const DoctorServiceService = require("./DoctorServiceService");

const DoctorService = {
    /**
     * Регистрация пользователя и получение токена
     * @param {Object} userData 
     * @param {Object} doctorData 
     * @param {Number} specialty_id  //Надо сделать, чтобы получал id
     * @param {Object} clinic_id 
     * @returns {String} token
     */
    createDoctor: async (userData, doctorData, specialtyId, clinicId, servicesIds) => {
        const t = await sequelize.transaction();

        try {
            await ClinicService.getClinicById(clinicId, { transaction: t });

            const createdUser = await UserService.createUser(userData, t);

            const createdDoctor = await createdUser.createDoctor(
                { clinic_id: clinicId, ...doctorData, specialty_id: specialtyId },
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
    getDoctorById: async (doctorId) => {
        try {
            console.log(doctorId);
            const doctor = await db.Doctors.findByPk(doctorId, {
                include: [
                    {
                        model: db.Users,
                        exclude: ["password"],
                        // include: [db.Address],
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
    getShortDoctorById: async (doctorId) => {
        try {
            console.log(doctorId);
            const doctor = await db.Doctors.findByPk(doctorId, {
                include: [
                    {
                        model: db.Users, attributes: ["id", "first_name", "last_name"],
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
                sortOptions.push({ "$User.name": filters.order === "desc" ? "DESC" : "ASC" });
            }
            const doctors = await db.Doctors.findAll({
                where: { clinic_id: clinicId },
                attributes: ["id"],
                include: [{
                    model: db.Users,
                    where: query,
                    attributes: ["first_name", "last_name", "gender"],
                }],
                order: sortOptions,
            })
            return doctors;
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
    updateDoctorById: async (doctorId, userData, doctorData, servicesIds) => {
        const t = await sequelize.transaction();

        try {
            const user = await UserService.updateUser(doctorId, userData, t);

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
};

module.exports = DoctorService;