const express = require("express");
const prescriptionController = require("../controllers/prescriptionController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { validateBody } = require("../utils/validation");
const { validateRequest } = require("../middleware/errorHandler")
const router = express.Router();

router.post("/prescriptions", validateBody("expirationDate"), validateRequest, isAuthenticated, hasRole("doctor"), prescriptionController.createPrescription);

router.get("/prescriptions", isAuthenticated, hasRole(["doctor", "patient"]), prescriptionController.getPrescriptions);

module.exports = router;