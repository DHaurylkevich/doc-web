const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

router.get("/patients", isAuthenticated, hasRole(["doctor", "clinic"]), patientController.getPatientsFilter);

router.get("/patients/:patientId", isAuthenticated, hasRole(["doctor", "admin"]), patientController.getPatientById);

router.get("/admins/patients", isAuthenticated, hasRole("admin"), patientController.getAllPatientsForAdmin);

module.exports = router;