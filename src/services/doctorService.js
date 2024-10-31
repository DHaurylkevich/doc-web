const sequelize = require("../config/db");
const db = require("../models");
const UserService = require("../services/userService");
const ClinicService = require("./clinicService");
const ServiceService = require("./serviceService");
const SpecialtyService = require("./specialtyService");
const DoctorSpecialtyService = require("./doctorSpecialtyService");

const DoctorService = {
    /**
     * Регистрация пользователя и получение токена
     * @param {Object} userData 
     * @param {Object} doctorData 
     * @param {Number} specialty_id  //Надо сделать, чтобы получал id
     * @param {Object} clinic_id 
     * @returns {String} token
     */
    createDoctor: async (userData, doctorData, specialtyIds, clinicId) => {
        const t = await sequelize.transaction();

        try {
            await ClinicService.getClinicById(clinicId);
            // await Promise.all(specialtyIds.map(async (specialtyId) => {
            //     await SpecialtyService.getSpecialtyById(specialtyId);
            // }));
            const createdUser = await UserService.createUser(userData, t);
            const createdDoctor = await createdUser.createDoctor({ clinic_id: clinicId, ...doctorData }, { transaction: t });
            await t.commit();

            await DoctorSpecialtyService.assignSpecialtyToDoctor(createdDoctor.id, specialtyIds);
            return createdDoctor;
        } catch (err) {
            await t.rollback();
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
                        model: db.Specialties, as: 'specialties'
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
    /**
     * 
     * @param {Number} id 
     * @param {Object} userData 
     * @param {Object} patientData 
     * @param {Object} addressData 
     * @returns {Object}
     */
    updateDoctor: async (userId, userData, doctorData) => {
        const t = await sequelize.transaction();

        try {
            const user = await UserService.updateUser(userId, userData, t);

            const doctor = await user.getDoctors();
            if (!doctor) {
                throw new Error("Doctor not found");
            }
            await doctor.update(doctorData, { transaction: t });
            console.log(doctor);

            await t.commit();
            return doctor;
        } catch (err) {
            await t.rollback();
            console.log(err);
            throw err;
        }
    },
    addServiceToDoctor: async (doctorId, data) => {
        const t = await sequelize.transaction();

        try {
            const createdDoctor = await db.Doctors.findByPk(doctorId);
            await Promise.all(datas.map(async (specialtyId) => {
                await SpecialtyService.getSpecialtyById(specialtyId);
                await ServiceService.getServiceById(serviceId);
            }));
            await createdDoctor.addServices(servicesIds, price, { transaction: t });

            await t.commit();
            return createdDoctor;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
};

module.exports = DoctorService;