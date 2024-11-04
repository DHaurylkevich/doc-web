const express = require("express");
const router = express.Router();
const ReviewController = require("../controllers/reviewController");

router.post("/reviews/", ReviewController.createReview);

router.get("/clinics/:clinicId/reviews", ReviewController.getAllReviewsByClinic);

router.get("/doctors/:doctorId/reviews", ReviewController.getAllReviewsByDoctor);

// router.put("/patients/:id", ReviewController.updatePatientById);

router.delete("/reviews/:reviewId", ReviewController.deleteReview);

module.exports = router;