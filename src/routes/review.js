const express = require("express");
const router = express.Router();
const ReviewController = require("../controllers/reviewController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { validateRequest } = require("../middleware/errorHandler");
const { countCheck } = require("../utils/validation/index");

router.post("/reviews/", isAuthenticated, hasRole("patient"), countCheck("rating", 1, 5), validateRequest, ReviewController.createReview);

router.get("/admins/reviews", isAuthenticated, hasRole("admin"), ReviewController.getAllPendingReviews);

router.delete("/admins/reviews/:reviewId", isAuthenticated, hasRole("admin"), ReviewController.deleteReview);

router.patch("/admins/reviews/:reviewId/moderate", isAuthenticated, hasRole("admin"), ReviewController.moderateReview);

router.get("/clinics/:clinicId/reviews", ReviewController.getAllReviewsByClinic);

router.get("/doctors/:doctorId/reviews", ReviewController.getAllReviewsByDoctor);

router.patch("/reviews/feedback", isAuthenticated, hasRole(["clinic", "patient"]), countCheck("rating", 1, 5), validateRequest, ReviewController.leaveFeedback);

router.get("/reviews/feedback", isAuthenticated, hasRole(["clinic", "patient"]), ReviewController.getFeedback);

module.exports = router;