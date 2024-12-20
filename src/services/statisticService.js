const db = require("../models");
const sequelize = require("../config/db");
const moment = require("moment");
const { Op } = require("sequelize");

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

            const percentageChange = ((totalCount - countBeforeToday) / countBeforeToday) * 100;

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
            console.log(beforeToday, currentRating);

            const percentageChange = ((currentRating.averageRating - beforeToday.averageRating) / beforeToday.averageRating) * 100;

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

            const percentageChange = ((totalCount - countBeforeToday) / countBeforeToday) * 100;

            return { percentageChange, totalCount, countBeforeToday };
        } catch (err) {
            throw err;
        }
    },
};

module.exports = StatisticsService;
//АДМИН: количество пользователей(пациентов)/клиники/докторов/визитов
//новые пользователи/клиники 4 штуки
// новых пользователей за

//ДОКТОР: колличество пациентов 
// колличество визитов