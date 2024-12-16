const ReviewService = require("../services/reviewService");

const ReviewController = {
    createReview: async (req, res, next) => {
        const { doctorId, rating, comment, tagsIds } = req.body;

        try {
            const userId = req.user.id;

            await ReviewService.createReview({ userId, doctorId, rating, comment, tagsIds });

            res.status(201).json({ message: "Review created successfully" });
        } catch (err) {
            next(err);
        }
    },
    getAllPendingReviews: async (req, res, next) => {
        const { limit, page } = req.query;

        try {
            const specialties = await ReviewService.getAllPendingReviews({ page, limit });
            res.status(200).json(specialties);
        } catch (err) {
            next(err);
        }
    },
    getAllReviewsByClinic: async (req, res, next) => {
        const { clinicId } = req.params;
        const { sortDate = 'ASC', sortRating = 'ASC', limit, page } = req.query;

        try {
            const reviews = await ReviewService.getAllReviewsByClinic(clinicId, { sortDate, sortRating, limit, page });
            res.status(200).json(reviews);
        } catch (err) {
            next(err);
        }
    },
    getAllReviewsByDoctor: async (req, res, next) => {
        const { doctorId } = req.params;
        const { limit, page } = req.query;

        try {
            const reviews = await ReviewService.getAllReviewsByDoctor({ doctorId, page, limit });
            res.status(200).json(reviews);
        } catch (err) {
            next(err);
        }
    },
    moderateReview: async (req, res, next) => {
        const { reviewId } = req.params;
        const { status, moderationComment } = req.body;

        try {
            await ReviewService.moderateReview(reviewId, status, moderationComment);
            res.status(200).json({ message: "Review update successfully" });
        } catch (err) {
            next(err);
        }
    },
    deleteReview: async (req, res, next) => {
        const { reviewId } = req.params;

        try {
            await ReviewService.deleteReview(reviewId);
            res.status(200).json({ message: "Review deleted successfully" });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = ReviewController;