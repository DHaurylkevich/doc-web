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

            const [result] = await db.Reviews.findAll({
                where: { doctor_id: doctorId },
                attributes: [
                    [sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('rating')), 1), 'averageRating'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews']
                ],
                raw: true
            });

            await doctor.update({ rating: result.averageRating })

            return {
                averageRating: result.averageRating,
                totalReviews: result.totalReviews
            };
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getAllReviews: async () => {
        try {
            return await db.ReviewTags.findAll({
                include: [
                    {
                        model: db.Reviews,
                        as: "review",
                        attributes: ["comment", "rating"],
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
                            }
                        ],
                    },
                    {
                        model: db.Tags,
                        as: "tag",
                        attributes: ["id", "name"]
                    }
                ]
            });
        } catch (err) {
            throw err;
        }
    },
    getAllReviewsByClinic: async (clinicId, { sortDate, sortRating, limit, offset }) => {
        try {
            const reviews = await db.ReviewTags.findAll({
                limit: limit,
                offset: offset < 0 ? 0 : offset,
                include: [
                    {
                        model: db.Reviews,
                        as: "review",
                        attributes: ["comment", "rating", "createdAt"],
                        include: [
                            {
                                model: db.Doctors,
                                as: "doctor",
                                where: { clinic_id: clinicId },
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
                            }
                        ],
                    },
                    {
                        model: db.Tags,
                        as: "tag",
                        attributes: ["id", "name"]
                    }
                ],
                order: [
                    [{ model: db.Reviews, as: "review" }, 'rating', sortRating === 'DESC' ? 'DESC' : 'ASC'],
                    [{ model: db.Reviews, as: "review" }, 'createdAt', sortDate === 'DESC' ? 'DESC' : 'ASC']
                ]
            });

            return reviews;
        } catch (err) {
            throw err;
        }
    },
    getAllReviewsByDoctor: async (doctorId) => {
        try {
            const reviews = await db.ReviewTags.findAll({
                include: [
                    {
                        model: db.Reviews,
                        as: "review",
                        where: { doctor_id: doctorId },
                        attributes: ["comment", "rating", "createdAt"],
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
                            }
                        ],
                    },
                    {
                        model: db.Tags,
                        as: "tag",
                        attributes: ["id", "name"]
                    }
                ]
            });

            return reviews;
        } catch (err) {
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
            return { message: "Review deleted successfully" };
        } catch (err) {
            throw err;
        }
    }
}

module.exports = ReviewService;