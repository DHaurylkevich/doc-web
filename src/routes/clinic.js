const express = require("express");
const router = express.Router();
// const { authenticateJWT } = require("../middleware/auth");
const clinicController = require("../controllers/clinicController");

router.post("/clinics", clinicController.createClinic);

router.get("/clinics/:id", clinicController.getClinic);

// router.get("/", clinicController.getFullClinic);

router.put("/clinics/:id", clinicController.updateClinicById);

router.delete("/clinics/:id", clinicController.deleteClinic);

module.exports = router;