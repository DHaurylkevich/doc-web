// const TEST = require("../../tests/unit/controllers/patientController.test.js");
const DoctorService = require("../services/doctorService");

const DoctorController = {
    /**
     * Вход пользователя
     * @param {Object} userData 
     * @param {Object} patientData
     * @param {Object} specialty_id
     * @param {Number} clinic_id
     * @param {*} next 
     */
    createDoctor: async (req, res, next) => {
        const { userData, doctorData, specialtyIds, clinicId } = req.body;

        try {
            const createdDoctor = await DoctorService.createDoctor(userData, doctorData, specialtyIds, clinicId);
            res.status(201).json(createdDoctor);
        } catch (err) {
            console.log(err);
            next(err);
        }
    },
    getShortDoctorById: async (req, res, next) => {
        const doctorId = req.params.id;

        try {
            const createdDoctor = await DoctorService.getShortDoctorById(doctorId);
            res.status(201).json(createdDoctor);
        } catch (err) {
            console.log(err);
            next(err);
        }
    },
    // /**
    //  * Обновление данных доктора
    //  * @param {*} req praram{ id } ,body{ userData, doctorData }
    //  * @param {*} res 
    //  * @param {*} next 
    //  */
    // updateDoctorById: async (req, res, next) => {
    //     const { id } = req.params;
    //     const { userData, doctorData } = req.body;

    //     try {
    //         const updatedDoctor = await DoctorService.updateDoctor(id, userData, doctorData);

    //         res.status(200).json(updatedDoctor);
    //     } catch (err) {
    //         next(err);
    //     }
    // },
    addServiceToDoctor: async (req, res, next) => {
        const doctorId = req.params.id;
        const { data } = req.body; // data: [{ specialtyId, services: [{ serviceId, price }] }]

        try {
            await DoctorService.addServiceToDoctor(doctorId, data);
            res.status(200).json({ message: "Successfully added services to doctor" });
        } catch (err) {
            next(err);
        }
    },
}

module.exports = DoctorController;