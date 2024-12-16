const db = require("../models");
const sequelize = require("../config/db");
const AppError = require("../utils/appError");
const { Op } = require("sequelize");

const ReviewService = {
    createReview: async ({ userId, doctorId, rating, comment, tagsIds }) => {
        const t = await sequelize.transaction();

        try {
            const patient = await db.Patients.findOne({
                where: { user_id: userId }
            });

            const doctor = await db.Doctors.findOne({
                where: { id: doctorId }
            });
            if (!doctor) {
                throw new AppError("Doctor not found", 404);
            }

            const newReview = await db.Reviews.create({
                patient_id: patient.id,
                doctor_id: doctorId,
                rating,
                comment,
            }, { transaction: t });

            if (tagsIds && tagsIds.length > 0) {
                const tagInstances = await db.Tags.findAll({
                    where: {
                        id: tagsIds,
                    },
                    transaction: t,
                });
                await newReview.addTags(tagInstances, { transaction: t });
            }

            await t.commit();
            return;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getAllPendingReviews: async ({ limit, page }) => {
        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;

        try {
            const { rows, count } = await db.Reviews.findAndCountAll({
                model: db.Reviews,
                where: { status: 'pending' },
                attributes: ["comment", "rating"],
                limit: parsedLimit,
                offset: offset,
                include: [
                    {
                        model: db.Doctors,
                        as: "doctor",
                        attributes: ["id", "description", "rating"],
                        include: [
                            {
                                model: db.Users,
                                as: "user",
                                attributes: ["first_name", "last_name"]
                            }
                        ]
                    },
                    {
                        model: db.Patients,
                        as: "patient",
                        attributes: ["id"],
                        include: [
                            {
                                model: db.Users,
                                as: "user",
                                attributes: ["first_name", "last_name", "photo"]
                            }
                        ]
                    },
                    {
                        model: db.Tags,
                        as: "tags",
                        attributes: ["id", "name"],
                        through: { attributes: [] },
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            const totalPages = Math.ceil(count / parsedLimit);
            if (page - 1 > totalPages) {
                throw new AppError("Page not found", 404);
            }

            if (!rows.length) {
                return [];
            }

            return { pages: totalPages, reviews: rows };
        } catch (err) {
            throw err;
        }
    },
    getAllReviewsByClinic: async (clinicId, { sortDate, sortRating, limit, page }) => {
        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;

        try {
            const { rows, count } = await db.Reviews.findAndCountAll({
                limit: parsedLimit,
                offset: offset,
                order: [
                    ['rating', sortRating === 'DESC' ? 'DESC' : 'ASC'],
                    ['createdAt', sortDate === 'DESC' ? 'DESC' : 'ASC']
                ],
                attributes: ["id", "comment", "rating"],
                where: { status: 'approved' },
                include: [
                    {
                        model: db.Doctors,
                        as: "doctor",
                        where: { clinic_id: clinicId },
                        attributes: ["id", "description", "rating", "user_id"],
                        include: [
                            {
                                model: db.Users,
                                as: "user",
                                attributes: ["first_name", "last_name"]
                            }
                        ]
                    },
                    {
                        model: db.Patients,
                        as: "patient",
                        attributes: ["id"],
                        include: [
                            {
                                model: db.Users,
                                as: "user",
                                attributes: ["first_name", "last_name", "photo"]
                            }
                        ]
                    },
                    {
                        model: db.Tags,
                        as: "tags",
                        attributes: ["id", "name"],
                        through: { attributes: [] }
                    }
                ],
            });

            const totalPages = Math.ceil(count / parsedLimit);
            if (page - 1 > totalPages) {
                throw new AppError("Page not found", 404);
            }

            if (!rows.length) {
                return [];
            }

            return { pages: totalPages, reviews: rows };
        } catch (err) {
            throw err;
        }
    },
    getAllReviewsByDoctor: async ({ doctorId, page, limit }) => {
        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;

        try {
            const { rows, count } = await db.Reviews.findAndCountAll({
                limit: parsedLimit,
                offset: offset,
                where: { doctor_id: doctorId },
                attributes: ["comment", "rating"],
                where: { status: 'approved' },
                include: [
                    {
                        model: db.Patients,
                        as: "patient",
                        attributes: ["id"],
                        include: [
                            {
                                model: db.Users,
                                as: "user",
                                attributes: ["first_name", "last_name", "photo"]
                            }
                        ]
                    },
                    {
                        model: db.Tags,
                        as: "tags",
                        attributes: ["id", "name"],
                        through: { attributes: [] }
                    }
                ]
            });

            const totalPages = Math.ceil(count / parsedLimit);
            if (page - 1 > totalPages) {
                throw new AppError("Page not found", 404);
            }

            if (!rows.length) {
                return [];
            }

            return { pages: totalPages, reviews: rows };
        } catch (err) {
            throw err;
        }
    },
    moderateReview: async (reviewId, status, moderationComment) => {
        const t = await sequelize.transaction();

        try {
            const review = await db.Reviews.findByPk(reviewId, { transaction: t });

            if (!review) {
                throw new AppError("Review not found", 404);
            }

            await review.update({
                status,
                moderationComment
            }, { transaction: t });

            if (status === 'approved') {
                const doctor = await db.Doctors.findByPk(review.doctor_id);
                const [result] = await db.Reviews.findAll({
                    where: {
                        doctor_id: review.doctor_id,
                        status: 'approved'
                    },
                    attributes: [
                        [sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('rating')), 1), 'averageRating']
                    ],
                    raw: true
                });

                await doctor.update({ rating: result.averageRating }, { transaction: t });
            }

            await t.commit();
            return;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    deleteReview: async (reviewId) => {
        try {
            const review = await db.Reviews.findByPk(reviewId);
            if (!review) {
                throw new AppError("Review not found");
            }

            await review.destroy();
            return;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = ReviewService;