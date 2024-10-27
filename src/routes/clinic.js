const express = require('express');
const router = express.Router();
// const { authenticateJWT } = require("../middleware/auth");
const clinicController = require('../controllers/clinicController');

router.post('/', clinicController.createClinic);

router.get('/:id', clinicController.getClinic);

// router.get('/', clinicController.getFullClinic);

router.put('/:id', clinicController.updateClinicById);

router.delete('/:id', clinicController.deleteClinic);

module.exports = router;