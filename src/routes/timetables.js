const express = require("express");
const router = express.Router();
const TimetableController = require("../controllers/timetableController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

router.put("/clinics/timetable", isAuthenticated, hasRole("clinic"), TimetableController.updateTimetable);

module.exports = router;