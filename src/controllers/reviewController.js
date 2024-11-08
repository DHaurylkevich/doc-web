const ReviewService = require("../services/reviewService");

const ReviewController = {
    createReview: async (req, res, next) => {
        const { patientId, doctorId, rating, comment, tagsIds } = req.body;

        try {
            const review = await ReviewService.createReview(patientId, doctorId, rating, comment, tagsIds);
            res.status(201).json(review);
        } catch (err) {
            console.log(err);
            next(err);
        }
    },
    // getSpecialty: async (req, res, next) => {
    //     const { id } = req.params;

    //     try {
    //         const specialty = await ReviewService.getSpecialtyById(id);
    //         res.status(200).json(specialty);
    //     } catch (err) {
    //         next(err);
    //     }
    // },
    // getAllSpecialties: async (req, res, next) => {
    //     try {
    //         const specialties = await ReviewService.getAllSpecialties();
    //         res.status(200).json(specialties);
    //     } catch (err) {
    //         console.log(err)
    //         next(err);
    //     }
    // },
    getAllReviewsByClinic: async (req, res, next) => {
        const { clinicId } = req.params;

        try {
            const reviews = await ReviewService.getAllReviewsByClinic(clinicId);
            res.status(200).json(reviews);
        } catch (err) {
            console.log(err)
            next(err);
        }
    },
    getAllReviewsByDoctor: async (req, res, next) => {
        const { doctorId } = req.params;

        try {
            const reviews = await ReviewService.getAllReviewsByDoctor(doctorId);
            res.status(200).json(reviews);
        } catch (err) {
            console.log(err)
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