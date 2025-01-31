const express = require("express");
const router = express.Router();
const ScheduleController = require("../controllers/scheduleController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { createSchedule } = require("../utils/validation/scheduleValidator");
const { validateRequest } = require("../middleware/errorHandler");

router.post("/clinics/schedules", createSchedule, validateRequest, isAuthenticated, hasRole("clinic"), ScheduleController.createSchedule)

router.get("/schedules", isAuthenticated, hasRole(["clinic", "doctor"]), ScheduleController.getScheduleByRole);

router.get("/schedules/available-slots", ScheduleController.getAvailableSlotsWithFilter);

router.get("/schedules/:scheduleId", ScheduleController.getScheduleById);

router.put("/schedules/:scheduleId", isAuthenticated, hasRole("clinic"), ScheduleController.updateSchedule);

router.delete("/schedules/:scheduleId", isAuthenticated, hasRole("clinic"), ScheduleController.deleteSchedule);

module.exports = router;