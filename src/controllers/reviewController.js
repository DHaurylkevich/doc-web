const ReviewService = require("../services/reviewService");

const ReviewController = {
    createReview: async (req, res, next) => {
        const { doctorId, rating, comment, tagsIds } = req.body;

        try {
            const userId = req.user.id;

            const review = await ReviewService.createReview({ userId, doctorId, rating, comment, tagsIds });

            res.status(201).json(review);
        } catch (err) {
            next(err);
        }
    },
    getAllReviews: async (req, res, next) => {
        try {
            const specialties = await ReviewService.getAllReviews();
            res.status(200).json(specialties);
        } catch (err) {
            next(err);
        }
    },
    getAllReviewsByClinic: async (req, res, next) => {
        const { clinicId } = req.params;
        const { sortDate = 'ASC', sortRating = 'ASC', limit = 10, offset = 0 } = req.query;

        try {
            const reviews = await ReviewService.getAllReviewsByClinic(clinicId, { sortDate, sortRating, limit, offset });
            res.status(200).json(reviews);
        } catch (err) {
            next(err);
        }
    },
    getAllReviewsByDoctor: async (req, res, next) => {
        const { doctorId } = req.params;

        try {
            const reviews = await ReviewService.getAllReviewsByDoctor(doctorId);
            res.status(200).json(reviews);
        } catch (err) {
            next(err);
        }
    },
    // updateSpecialty: async (req, res, next) => {
    //     const { id } = req.params;
    //     const { specialtyData } = req.body;

    //     try {
    //         const updateSpecialty = await ReviewService.updateSpecialty(id, specialtyData);
    //         res.status(200).json(updateSpecialty);
    //     } catch (err) {
    //         next(err);
    //     }
    // },
    deleteReview: async (req, res, next) => {
        const { reviewId } = req.params;

        try {
            const message = await ReviewService.deleteReview(reviewId);
            res.status(200).json(message);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = ReviewController;