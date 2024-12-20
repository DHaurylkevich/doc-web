const { Op } = require("sequelize");
const db = require("../models");
const AppError = require("../utils/appError");

const SearchService = {
    searchPosts: async (query, page, limit) => {
        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;
        const words = query.split(" ");
        const queryWhere = words.map(word => "%" + word + "%");

        try {
            const { rows, count } = await db.Posts.findAndCountAll({
                offset,
                limit: parsedLimit,
                attributes: { exclude: ["updatedAt", "id", "category_id"] },
                where: {
                    [Op.or]: [
                        {
                            title: {
                                [Op.iLike]: {
                                    [Op.any]: queryWhere,
                                },
                            }
                        },
                        {
                            content: {
                                [Op.iLike]: {
                                    [Op.any]: queryWhere,
                                },
                            }
                        },
                        {
                            '$category.name$': {
                                [Op.iLike]: {
                                    [Op.any]: queryWhere,
                                },
                            }
                        }
                    ]
                },
                include: [
                    {
                        model: db.Categories,
                        as: "category",
                        attributes: ["name"]
                    }
                ]
            });
            const totalPages = Math.ceil(count / parsedLimit);

            return { posts: rows, pages: totalPages };
        } catch (err) {
            throw err;
        }
    },
    searchPatients: async (query, page, limit, user) => {
        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;
        const words = query.split(" ");
        const queryWhere = words.map(word => "%" + word + "%");

        let appointmentWhere = {};
        let userInclude = {};
        switch (user.role) {
            case "clinic":
                userInclude = {
                    attributes: ["first_name", "last_name", "photo", "phone"],
                };
                appointmentWhere = {
                    model: db.Appointments,
                    as: "appointments",
                    attributes: [],
                    include: [
                        {
                            model: db.Clinics,
                            where: { id: user.id },
                            as: "clinic",
                            attributes: ["id"]
                        }
                    ]
                };
                break;
            case "doctor":
                userInclude = {
                    attributes: ["first_name", "last_name", "photo", "phone", "pesel", "gender", "birthday", "createdAt"],
                    include: [
                        {
                            model: db.Addresses,
                            as: "address",
                            attributes: { exclude: ["createdAt", "updatedAt", "id", "user_id", "clinic_id"] }
                        }
                    ]
                };
                appointmentWhere = {
                    model: db.Appointments,
                    as: "appointments",
                    attributes: [],
                    include: [
                        {
                            model: db.DoctorService,
                            where: { doctor_id: user.roleId },
                            as: "doctorService",
                            attributes: ["doctor_id"],
                        }
                    ]
                };
                break;
            default:
                userInclude = {
                    attributes: ["first_name", "last_name", "photo", "phone", "gender", "birthday", "createdAt"],
                };
                break;
        }
        const includeArray = [
            {
                model: db.Users,
                as: "user",
                ...userInclude,
                where: {
                    [Op.or]: [
                        {
                            first_name: {
                                [Op.iLike]: { [Op.any]: queryWhere },
                            }
                        },
                        {
                            last_name: {
                                [Op.iLike]: { [Op.any]: queryWhere },
                            }
                        },
                    ],
                },
            },
        ];
        if (Object.keys(appointmentWhere).length > 0) {
            includeArray.push(appointmentWhere);
        }

        try {
            const { rows, count } = await db.Patients.findAndCountAll({
                offset,
                limit: parsedLimit,
                attributes: [],
                include: includeArray
            });
            const totalPages = Math.ceil(count / parsedLimit);

            return { patients: rows, pages: totalPages };
        } catch (err) {
            throw err;
        }
    },
    searchDoctors: async (query, page, limit, user) => {
        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;
        const words = query.split(" ");
        const queryWhere = words.map(word => "%" + word + "%");

        let doctorWhere = {};
        let otherInclude = {};
        let userInclude = {};
        switch (user.role) {
            case "clinic":
                doctorWhere = { clinic_id: user.id };
                userInclude = {
                    attributes: ["first_name", "last_name", "gender", "photo", "email"],
                    include: [
                        {
                            model: db.Addresses,
                            as: "address",
                            attributes: { exclude: ["createdAt", "updatedAt", "id", "user_id", "clinic_id"] }
                        }
                    ]
                };
                otherInclude = {
                    model: db.Specialties,
                    as: 'specialty',
                    attributes: ["name"],
                    include: [
                        { model: db.Services, as: "services", attributes: ["name"] }
                    ]
                };
                appointmentWhere = {
                    model: db.Clinics,
                    where: { id: user.id },
                    as: "clinic",
                    attributes: ["id"]
                };
                break;
            case "admin":
                userInclude = {
                    attributes: ["first_name", "last_name", "gender", "createdAt", "birthday"]
                };
                otherInclude = {
                    model: db.Clinics,
                    as: "clinic",
                    attributes: ["name"]
                };
                break;
        }

        try {
            const { rows, count } = await db.Doctors.findAndCountAll({
                offset,
                limit: parsedLimit,
                attributes: ["id"],
                where: doctorWhere,
                required: true,
                include: [
                    otherInclude,
                    {
                        model: db.Users,
                        as: "user",
                        ...userInclude,
                        where: {
                            [Op.or]: [
                                {
                                    first_name: {
                                        [Op.iLike]: { [Op.any]: queryWhere },
                                    }
                                },
                                {
                                    last_name: {
                                        [Op.iLike]: { [Op.any]: queryWhere },
                                    }
                                },
                            ],
                        },
                    }
                ]
            });

            const totalPages = Math.ceil(count / parsedLimit);

            return { doctors: rows, pages: totalPages };
        } catch (err) {
            throw err;
        }
    },
    searchClinic: async (query, page, limit) => {
        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;
        const words = query.split(" ");
        const queryWhere = words.map(word => "%" + word + "%");

        try {
            const { rows, count } = await db.Clinics.findAndCountAll({
                offset,
                limit: parsedLimit,
                attributes: { exclude: ["resetToken", "updatedAt", "role", "password"] },
                where: {
                    [Op.or]: [
                        {
                            name: {
                                [Op.iLike]: { [Op.any]: queryWhere },
                            }
                        }
                    ],
                },
                include: [
                    {
                        model: db.Addresses,
                        as: "address",
                        attributes: ["city", "street", "home", "flat"]
                    },
                    {
                        model: db.Timetables,
                        as: "timetables",
                        attributes: ["day_of_week", "start_time", "end_time"]
                    }
                ]
            });

            const totalPages = Math.ceil(count / parsedLimit);

            return { clinics: rows, pages: totalPages };
        } catch (err) {
            throw err;
        }
    },
    searchPrescription: async (query, page, limit, doctorId) => {
        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;
        const words = query.split(" ");
        const queryWhere = words.map(word => "%" + word + "%");

        try {
            const { rows, count } = await db.Prescriptions.findAndCountAll({
                offset,
                limit: parsedLimit,
                where: { doctor_id: doctorId },
                attributes: ["code", "expiration_date"],
                include: [
                    {
                        model: db.Patients,
                        as: "patient",
                        required: true,
                        attributes: ["id"],
                        include: [
                            {
                                model: db.Users,
                                as: "user",
                                attributes: ["first_name", "last_name", "photo"],
                                where: {
                                    [Op.or]: [
                                        {
                                            first_name: {
                                                [Op.iLike]: { [Op.any]: queryWhere },
                                            }
                                        },
                                        {
                                            last_name: {
                                                [Op.iLike]: { [Op.any]: queryWhere },
                                            }
                                        },
                                    ],
                                },
                            }
                        ]
                    },
                    { model: db.Medications, as: "medications", attributes: ["name"] },
                ]
            });
            const totalPages = Math.ceil(count / parsedLimit);

            return { prescription: rows, pages: totalPages };
        } catch (err) {
            throw err;
        }
    },
};

module.exports = SearchService;
