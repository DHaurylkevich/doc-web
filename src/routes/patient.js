const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");

router.post("/", patientController.registrationPatient);

router.get("/", patientController.getPatientsFilter);

router.get("/:id", patientController.getPatientById);

router.put("/:id", patientController.updatePatientById);

module.exports = router;