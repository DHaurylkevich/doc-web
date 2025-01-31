const express = require("express");
const router = express.Router();
const AppointmentController = require("../controllers/appointmentController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { validateRequest } = require('../middleware/errorHandler');;
const validation = require('../utils/validation/appointmentValidation');
const { validateParam } = require('../utils/validation');

router.post("/appointments", isAuthenticated, hasRole("patient"), validation.createDataExist, validateRequest, AppointmentController.createAppointment);

router.delete("/patients/appointments/:appointmentId", isAuthenticated, hasRole("patient"), validateParam("appointmentId"), validateRequest, AppointmentController.deleteAppointment);

router.get("/clinics/appointments", isAuthenticated, hasRole("clinic"), validateRequest, AppointmentController.getAppointmentsByClinic);

router.get("/doctors/appointments", isAuthenticated, hasRole("doctor"), validateRequest, AppointmentController.getAppointmentsByDoctor);

router.get("/doctors/patients/:patientId/appointments", isAuthenticated, hasRole("doctor"), validateRequest, AppointmentController.getAppointmentsByPatientId);

router.get("/patients/appointments", isAuthenticated, hasRole("patient"), validateRequest, AppointmentController.getAppointmentsByPatient);

module.exports = router;