const express = require("express");
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/auth');
const ClinicController = require("../controllers/clinicController");

router.post("/clinics", isAuthenticated, hasRole("admin"), ClinicController.createClinic);

router.get("/clinics", ClinicController.getAllClinicByParams);

router.get("/admins/clinics", isAuthenticated, hasRole("admin"), ClinicController.getAllClinicsForAdmin);

router.get("/clinics/cities", ClinicController.getAllCities);

router.get("/clinics/:clinicId", ClinicController.getFullClinic);

router.put("/clinics", isAuthenticated, hasRole("clinic"), ClinicController.updateClinicById);

module.exports = router;