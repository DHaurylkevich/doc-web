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
        switch (user.role) {
            case "clinic":
                appointmentWhere = {
                    model: db.Clinics,
                    where: { id: user.id },
                    as: "clinic",
                    attributes: ["id"]
                }
                break;
            case "doctor":
                appointmentWhere = {
                    model: db.DoctorService,
                    where: { doctor_id: user.roleId },
                    as: "doctorService",
                    attributes: ["doctor_id"],
                }
                break;
            case "patient":
                throw new AppError("Access denied", 403);
                break;
        }

        try {
            const { rows, count } = await db.Patients.findAndCountAll({
                offset,
                limit: parsedLimit,
                attributes: [],
                include: [
                    {
                        model: db.Users,
                        as: "user",
                        attributes: ["id", "first_name", "last_name"],
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
                    {
                        model: db.Appointments,
                        as: "appointments",
                        attributes: [],
                        include: [appointmentWhere]
                    }
                ]
            });
            const totalPages = Math.ceil(count / parsedLimit);

            return { posts: rows, pages: totalPages };
        } catch (err) {
            throw err;
        }
    },
    //Клинника ищет своих админ всех
    searchDoctors: async (query, page, limit, user) => {
        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;
        const words = query.split(" ");
        const queryWhere = words.map(word => "%" + word + "%");

        if (user.role === "clinic" && user.role === "admin") {
            throw new AppError("Access denied", 403);
        }
        const doctorWhere = user.role === "clinic" ? { clinic_id: user.id } : {}

        try {
            const { rows, count } = await db.Doctors.findAndCountAll({
                offset,
                limit: parsedLimit,
                attributes: [],
                where: doctorWhere,
                include: [
                    {
                        model: db.Users,
                        as: "user",
                        attributes: ["id", "first_name", "last_name"],
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

            return { posts: rows, pages: totalPages };
        } catch (err) {
            throw err;
        }
    },
    searchClinic: async () => {
        //Админ ищет всех
    },
    searchPrescription: async () => {
        //Доктор ищет не понятно, то ли только по пациентам, то ли и по лекарствам
    },
};

module.exports = SearchService;