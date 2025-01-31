const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { serviceCreateValidation } = require('../utils/validation');
const { validateRequest } = require('../middleware/errorHandler');

router.post("/clinics/services", serviceCreateValidation, validateRequest, isAuthenticated, hasRole("clinic"), serviceController.createService);

router.get("/clinics/:clinicId/services", serviceController.getServicesByClinic);

router.get("/services/:serviceId", serviceController.getServiceById);

router.get("/doctors/:doctorId/services", serviceController.getServicesByDoctor);

router.put("/clinics/services/:serviceId", isAuthenticated, hasRole("clinic"), serviceController.updateService);

router.delete("/clinics/services/:serviceId", isAuthenticated, hasRole("clinic"), serviceController.deleteService);

module.exports = router;