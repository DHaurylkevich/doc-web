const express = require("express");
const router = express.Router();
const specialtyController = require("../controllers/specialtyController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

router.post("/specialties", isAuthenticated, hasRole('admin'), specialtyController.createSpecialty);

router.get("/specialties", specialtyController.getAllSpecialties);

router.get("/clinic/:clinicId/specialties", specialtyController.getAllSpecialtiesByClinic);

router.get("/specialties/:specialtyId", specialtyController.getSpecialty);

router.put("/specialties/:specialtyId", isAuthenticated, hasRole('admin'), specialtyController.updateSpecialty);

router.delete("/specialties/:specialtyId", isAuthenticated, hasRole('admin'), specialtyController.deleteSpecialty);

module.exports = router;