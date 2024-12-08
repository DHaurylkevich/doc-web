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

            return;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getAllReviews: async () => {
        try {
            return await db.Reviews.findAll({
                model: db.Reviews,
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
                    },
                    {
                        model: db.Tags,
                        as: "tags",
                        attributes: ["id", "name"],
                        through: { attributes: [] },
                    }
                ],
            });
        } catch (err) {
            throw err;
        }
    },
    getAllReviewsByClinic: async (clinicId, { sortDate, sortRating, limit, offset }) => {
        try {
            return await db.Reviews.findAll({
                limit: limit,
                offset: offset < 0 ? 0 : offset,
                attributes: ["id", "comment", "rating", "createdAt"],
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
                order: [
                    ['rating', sortRating === 'DESC' ? 'DESC' : 'ASC'],
                    ['createdAt', sortDate === 'DESC' ? 'DESC' : 'ASC']
                ]
            });
        } catch (err) {
            throw err;
        }
    },
    getAllReviewsByDoctor: async (doctorId, offset, limit) => {
        try {
            return await db.Reviews.findAll({
                limit: limit,
                offset: offset < 0 ? 0 : offset,
                where: { doctor_id: doctorId },
                attributes: ["comment", "rating"],
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
            return;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = ReviewService;