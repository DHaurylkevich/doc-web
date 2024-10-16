// const TEST = require("../../tests/unit/services/doctorService.test");
const sequelize = require("../config/db");
const UserService = require("../services/userService");
const ClinicService = require("../services/clinicService");
const SpecialtyService = require("../services/specialtyService");

const DoctorService = {
    /**
     * Регистрация пользователя и получение токена
     * @param {Object} userData 
     * @param {Object} doctorData 
     * @param {Number} specialty_id  //Надо сделать, чтобы получал id
     * @param {Object} clinic_id 
     * @returns {String} token
     */
    createDoctorByClinic: async (userData, doctorData, specialty_id, clinic_id) => {
        const t = await sequelize.transaction();

        try {
            await ClinicService.findById(clinic_id);
            await SpecialtyService.findById(specialty_id);

            const createdUser = await UserService.createUser(userData, t);
            const createdPatient = await createdUser.createDoctor({ specialty_id: specialty_id, clinic_id: clinic_id, ...doctorData }, { transaction: t });

            await t.commit();
            return createdPatient;
        } catch (err) {
            await t.rollback();
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
}

module.exports = DoctorService;