const db = require("../models");
const sequelize = require("../config/db");

const ReviewService = {
    createReview: async (patientId, doctorId, rating, comment, tagsIds) => {
        const t = await sequelize.transaction();

        try {
            const newReview = await db.Reviews.create({
                patient_id: patientId,
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
            return newReview;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },
    getAllReviews: async () => {
        try {
            const reviews = await db.Reviews.findAll({
                include: [
                    {
                        model: db.Tags,
                        as: "tags",
                    },
                    {
                        model: db.Patients,
                        as: "patient",
                    },
                    {
                        model: db.Doctors,
                        as: "doctor",
                    },
                ],
            });
            return reviews;
        } catch (err) {
            throw err;
        }
    },
    getAllReviewsByClinic: async (clinicId) => {
        try {
            const reviews = await db.Reviews.findAll({
                include: [
                    {
                        model: db.Doctors,
                        as: "doctor",
                        where: { clinic_id: clinicId }
                    }
                ]
            });

            return reviews;
        } catch (err) {
            throw err;
        }
    },
    getAllReviewsByDoctor: async (doctorId) => {
        try {
            const reviews = await db.Reviews.findAll({
                where: { doctor_id: doctorId },
                include: [
                    {
                        model: db.Doctors,
                        as: "doctor",
                    }
                ]
            });

            return reviews;
        } catch (err) {
            throw err;
        }
    },
    getReviewsById: async (id) => {
        try {
            const reviews = await db.Reviews.findByPk(id);
            if (!reviews) {
                throw new Error("Reviews not found");
            }

            return reviews;
        } catch (err) {
            throw err;
        }
    },
    deleteReview: async (reviewId) => {
        try {
            const review = await db.Reviews.findByPk(reviewId);
            if (!review) {
                throw new Error("Review not found");
            }

            await review.destroy();
            return { message: "Review deleted successfully" };
        } catch (err) {
            throw err;
        }
    }
}

module.exports = ReviewService;