const express = require("express");
const router = express.Router();
const SearchController = require("../controllers/searchController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

router.get("/search/posts", SearchController.searchPosts);

router.get("/search/patients", isAuthenticated, hasRole(["clinic", "doctor", "admin"]), SearchController.searchPatients);

router.get("/search/doctors", isAuthenticated, hasRole(["clinic", "admin"]), SearchController.searchDoctors);

router.get("/search/clinics", isAuthenticated, hasRole("admin"), SearchController.searchClinics);

router.get("/search/prescriptions", isAuthenticated, hasRole("doctor"), SearchController.searchPrescriptions);

module.exports = router; 