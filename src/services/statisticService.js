const db = require("../models");
const sequelize = require("../config/db");

const StatisticsService = {
    countPatients: async (user) => {
        let appointmentWhere = {};
        switch (user.role) {
            case "clinic":
                appointmentWhere = {
                    where: { clinic_id: user.id }
                };
                break;
            case "doctor":
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
                break;
        }
        try {
            const count = await db.Patients.count(
                {
                    raw: true,
                    include: [
                        {
                            model: db.Appointments,
                            as: "appointments",
                            attributes: [],
                            required: true,
                            ...appointmentWhere
                        }
                    ]
                }
            );

            return count;
        } catch (err) {
            throw err;
        }
    },
    averageScore: async (clinicId) => {
        try {
            const clinic = await db.Clinics.findOne({
                raw: true,
                where: { id: clinicId },
                attributes: [
                    [
                        sequelize.literal(`(
                            SELECT COALESCE(ROUND(AVG(d.rating)::numeric, 1), 0)
                            FROM doctors d
                            WHERE d.clinic_id = :clinicId
                        )`),
                        'averageRating'
                    ]
                ],
                replacements: { clinicId }
            });
            return clinic.averageRating;
        } catch (err) {
            throw err;
        }
    },
    countAppointments: async (doctorId) => {
        try {
            const count = await db.Appointments.count({
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
            });
            return count;
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