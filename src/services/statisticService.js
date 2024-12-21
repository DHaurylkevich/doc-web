const db = require("../models");
const sequelize = require("../config/db");
const moment = require("moment");
const { Op } = require("sequelize");
const { tr } = require("@faker-js/faker");

const calculatePercentage = (total, beforeToday) => {
    if (beforeToday === 0) return total === 0 ? 0 : 100;
    ;
    return ((total - beforeToday) / beforeToday) * 100;
};

const StatisticsService = {
    countPatients: async (user) => {
        let appointmentWhere = {};

        if (user.role === "doctor") {
            appointmentWhere = {
                include: [
                    {
                        model: db.DoctorService,
                        as: 'doctorService',
                        required: true,
                        where: { doctor_id: user.roleId },
                    }
                ]
            };
        }

        const today = moment().startOf('day').toDate();

        try {
            const [countBeforeToday, totalCount] = await Promise.all([
                db.Patients.count({
                    raw: true,
                    attributes: [],
                    include: [
                        {
                            model: db.Appointments,
                            as: "appointments",
                            attributes: [],
                            required: true,
                            where: {
                                createdAt: { [Op.lt]: today },
                                ...(user.role === "clinic" && { clinic_id: user.id })
                            },
                            ...appointmentWhere,
                        }
                    ]
                }),
                db.Patients.count({
                    raw: true,
                    attributes: [],
                    include: [
                        {
                            model: db.Appointments,
                            as: "appointments",
                            attributes: [],
                            required: true,
                            where: { ...(user.role === "clinic" && { clinic_id: user.id }) },
                            ...appointmentWhere
                        }
                    ]
                })
            ]);

            // const percentageChange = ((totalCount - countBeforeToday) / countBeforeToday) * 100;
            const percentageChange = calculatePercentage(totalCount - countBeforeToday);

            return { percentageChange, totalCount };
        } catch (err) {
            throw err;
        }
    },
    averageScore: async (clinicId) => {
        const today = moment().startOf('day').toDate();

        try {
            const [beforeToday, currentRating] = await Promise.all([
                db.Clinics.findOne({
                    raw: true,
                    where: {
                        id: clinicId,
                        createdAt: { [Op.lt]: today }
                    },
                    attributes: [
                        [
                            sequelize.literal(`(
                                SELECT COALESCE(ROUND(AVG(d.rating)::numeric, 1), 0)
                                FROM doctors d
                                WHERE d.clinic_id = ${clinicId}
                            )`),
                            'averageRating'
                        ]
                    ]
                }),
                db.Clinics.findOne({
                    raw: true,
                    where: { id: clinicId },
                    attributes: [
                        [
                            sequelize.literal(`(
                                SELECT COALESCE(ROUND(AVG(d.rating)::numeric, 1), 0)
                                FROM doctors d
                                WHERE d.clinic_id = ${clinicId}
                            )`),
                            'averageRating'
                        ]
                    ]
                })
            ]);

            // const percentageChange = ((currentRating.averageRating - beforeToday.averageRating) / beforeToday.averageRating) * 100;
            const percentageChange = calculatePercentage(currentRating.averageRating - beforeToday.averageRating);

            return { percentageChange, currentRating: currentRating.averageRating };
        } catch (err) {
            throw err;
        }
    },
    countAppointments: async (doctorId) => {
        const today = moment().startOf('day').toDate();
        try {

            const [countBeforeToday, totalCount] = await Promise.all([
                db.Appointments.count({
                    raw: true,
                    attributes: [],
                    where: {
                        status: "active",
                        createdAt: { [Op.gt]: today }
                    },
                    include: [
                        {
                            model: db.DoctorService,
                            as: 'doctorService',
                            where: { doctor_id: doctorId },
                        }
                    ]
                }),
                db.Appointments.count({
                    raw: true,
                    attributes: [],
                    where: { status: "active" },
                    include: [
                        {
                            model: db.DoctorService,
                            as: 'doctorService',
                            where: { doctor_id: doctorId },
                        }
                    ]
                })
            ]);

            // const percentageChange = ((totalCount - countBeforeToday) / countBeforeToday) * 100;
            const percentageChange = calculatePercentage(totalCount - countBeforeToday);

            return { percentageChange, totalCount };
        } catch (err) {
            throw err;
        }
    },
    mainStatist: async (start_date, end_date) => {
        const today = start_date ? start_date : moment().startOf('day').toDate();
        const datesWhere = start_date && end_date ? { createdAt: { [Op.between]: [start_date, end_date] } } : {}

        try {
            const [
                beforeTodayPatient,
                totalPatient,
                beforeTodayClinic,
                totalClinic,
                beforeTodayDoctor,
                totalDoctor,
                beforeTodayAppointment,
                totalAppointment
            ] = await Promise.all([
                db.Patients.count({
                    raw: true,
                    attributes: [],
                    where: { createdAt: { [Op.lt]: today } }
                }),
                db.Patients.count({ raw: true, attributes: [], where: datesWhere }),
                db.Clinics.count({
                    raw: true,
                    attributes: [],
                    where: { createdAt: { [Op.lt]: today } }

                }),
                db.Clinics.count({ raw: true, attributes: [], where: datesWhere }),
                db.Doctors.count({
                    raw: true,
                    attributes: [],
                    where: { createdAt: { [Op.lt]: today } }

                }),
                db.Doctors.count({ raw: true, attributes: [], where: datesWhere }),
                db.Appointments.count({
                    raw: true,
                    attributes: [],
                    where: { createdAt: { [Op.lt]: today } }
                }),
                db.Appointments.count({ raw: true, attributes: [], where: datesWhere }),
            ]);

            const percentagePatient = calculatePercentage(totalPatient, beforeTodayPatient);
            const percentageClinics = calculatePercentage(totalClinic, beforeTodayClinic);
            const percentageDoctors = calculatePercentage(totalDoctor, beforeTodayDoctor);
            const percentageAppointments = calculatePercentage(totalAppointment, beforeTodayAppointment);

            return { totalPatient, percentagePatient, totalClinic, percentageClinics, totalDoctor, percentageDoctors, totalAppointment, percentageAppointments };
        } catch (err) {
            throw err;
        }
    },
    countNewPatientsAndClinics: async () => {
        const oneYearAgo = moment().subtract(1, 'years').toDate();

        try {
            const [newPatients, allPatients, newClinics, allClinics] = await Promise.all([
                db.Patients.findAll({
                    limit: 4,
                    order: [['createdAt', 'DESC']],
                    attributes: ['createdAt', "id"],
                    include: [
                        {
                            model: db.Users,
                            as: 'user',
                            attributes: ["first_name", "last_name",]
                        }
                    ]
                }),
                db.Patients.findAll({
                    order: [['createdAt', 'DESC']],
                    attributes: ['createdAt'],
                    where: { createdAt: { [Op.gte]: oneYearAgo } }
                }),
                db.Clinics.findAll({
                    limit: 4,
                    order: [['createdAt', 'DESC']],
                    attributes: ['createdAt', "name"],
                }),
                db.Clinics.findAll({
                    order: [['createdAt', 'DESC']],
                    attributes: ['createdAt'],
                    where: { createdAt: { [Op.gte]: oneYearAgo } }
                })
            ]);

            return { newPatients, allPatients, newClinics, allClinics };
        } catch (err) {
            throw err;
        }
    },
    ratingsStatistics: async (start_date, end_date) => {
        const datesWhere = start_date && end_date ? { createdAt: { [Op.between]: [start_date, end_date] } } : {}

        try {
            const [doctorRatings, cityRating, clinicsFeedback, patientsFeedback] = await Promise.all([
                db.Doctors.findAll({
                    raw: true,
                    limit: 5,
                    attributes: ['rating'],
                    where: datesWhere,
                    group: ['rating'],
                    order: [['rating', 'DESC']],
                }),
                db.Clinics.findAll({
                    raw: true,
                    attributes: [
                        [sequelize.col('address.city'), 'city'],
                        [sequelize.literal(`(
                            SELECT COALESCE(ROUND(CAST(AVG(d.rating) AS numeric), 1), 0)
                            FROM doctors d
                            WHERE d.clinic_id = "Clinics".id
                        )`), 'averageRating']
                    ],
                    where: datesWhere,
                    include: [
                        {
                            model: db.Addresses,
                            required: true,
                            as: 'address',
                            attributes: ["city"]
                        }
                    ],
                    group: ['address.city', 'Clinics.id'],
                    order: [[sequelize.literal('"averageRating"'), 'DESC']],
                    limit: 5,
                }),
                db.Clinics.findAll({
                    raw: true,
                    attributes: [
                        "feedbackRating",
                        [sequelize.fn('COUNT', sequelize.col('feedbackRating')), 'count']
                    ],
                    where: { feedbackRating: { [Op.ne]: null } },
                    group: ['feedbackRating'],
                }),
                db.Patients.findAll({
                    raw: true,
                    attributes: [
                        "feedbackRating",
                        [sequelize.fn('COUNT', sequelize.col('feedbackRating')), 'count']
                    ],
                    where: { feedbackRating: { [Op.ne]: null } },
                    group: ['feedbackRating'],
                })
            ]);

            return { doctorRatings, cityRating, clinicsFeedback, patientsFeedback };
        } catch (err) {
            throw err;
        }
    },
    clinicProvinceStatistics: async () => {
        try {
            const results = await db.Addresses.findAll({
                attributes: [
                    [sequelize.col('province'), 'province'],
                    [sequelize.fn('COUNT', sequelize.col('clinic.id')), 'clinicCount']
                ],
                include: [
                    {
                        model: db.Clinics,
                        required: true,
                        as: 'clinic',
                        attributes: []
                    }
                ],
                group: ['Addresses.province'],
                order: [[sequelize.fn('COUNT', sequelize.col('clinic.id')), 'DESC']],
                raw: true
            });
            return results;
        } catch (err) {
            throw err;
        }
    }
};

module.exports = StatisticsService;
//АДМИН: количество пользователей(пациентов)/клиники/докторов/визитов
// новых пользователей за