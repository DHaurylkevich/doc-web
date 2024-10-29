// const TEST = require("../../tests/unit/services/doctorService.test");
const sequelize = require("../config/db");
const db = require("../models");
const UserService = require("../services/userService");
const ClinicService = require("./clinicService");
const SpecialtyService = require("./specialtyService");

const DoctorService = {
    /**
     * Регистрация пользователя и получение токена
     * @param {Object} userData 
     * @param {Object} doctorData 
     * @param {Number} specialty_id  //Надо сделать, чтобы получал id
     * @param {Object} clinic_id 
     * @returns {String} token
     */
    createDoctor: async (userData, doctorData, specialty_id, clinic_id) => {
        const t = await sequelize.transaction();

        try {
            await ClinicService.getClinicById(clinic_id);
            await SpecialtyService.getSpecialtyById(specialty_id);

            const createdUser = await UserService.createUser(userData, t);
            const createdDoctor= await createdUser.createDoctor({ specialty_id: specialty_id, clinic_id: clinic_id, ...doctorData }, { transaction: t });

            await t.commit();
            return createdDoctor;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getDoctorById: async (id) => {
        try {
            const doctor = await db.Doctors.findByPk(id);
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
    updateDoctor: async (id, userData, doctorData) => {
        const t = await sequelize.transaction();

        try {
            const user = await UserService.updateUser(id, userData, t);

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
};

module.exports = DoctorService;