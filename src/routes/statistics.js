const express = require("express");
const router = express.Router();
const StatisticController = require("../controllers/statisticController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

router.get("/doctors/statistics", isAuthenticated, hasRole("doctor"), StatisticController.getDoctorStatistics);

router.get("/clinics/statistics", isAuthenticated, hasRole("clinic"), StatisticController.getClinicStatistics);

router.get("/admins/statistics", isAuthenticated, hasRole("admin"), StatisticController.getAdminStatistics);

router.get("/admins/statistics/details", isAuthenticated, hasRole("admin"), StatisticController.getAdminStatisticDetails);

router.get("/statistics", StatisticController.mainPageStatistics);

module.exports = router;