const express = require("express");
const MedicationController = require("../controllers/medicationController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { validateBody } = require("../utils/validation");
const { validateRequest } = require("../middleware/errorHandler");
const router = express.Router();

router.post("/medications", validateBody("name"), validateRequest, isAuthenticated, hasRole("admin"), MedicationController.createMedication);

router.get("/medications", isAuthenticated, MedicationController.getAllMedications);

router.put("/medications/:medicationId", validateBody("name"), validateRequest, isAuthenticated, hasRole("admin"), MedicationController.updateMedication);

router.delete("/medications/:medicationId", isAuthenticated, hasRole("admin"), MedicationController.deleteMedication);

module.exports = router;