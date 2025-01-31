const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

router.post("/clinics/doctors/", isAuthenticated, hasRole("clinic"), doctorController.createDoctor);

router.get("/doctors/:doctorId/short", doctorController.getShortDoctorById);

router.get("/doctors/:doctorId", doctorController.getDoctorById);

router.get("/admins/doctors", isAuthenticated, hasRole("admin"), doctorController.getAllDoctorsForAdmin);

router.put("/clinics/doctors/:doctorId", isAuthenticated, hasRole("clinic"), doctorController.updateDoctorById);

router.get("/clinics/:clinicId/doctors", doctorController.getDoctorsByClinicWithSorting);

module.exports = router;