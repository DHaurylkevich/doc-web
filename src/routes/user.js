const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/auth");
const { passwordValidation } = require('../utils/validation/userValidation');
const { validateRequest } = require('../middleware/errorHandler');
const upload = require("../middleware/upload").uploadImages;


router.get("/users/account", isAuthenticated, UserController.getUserAccount);

router.put("/users", isAuthenticated, UserController.updateUser);

router.patch("/users/password", isAuthenticated, passwordValidation, validateRequest, UserController.updateUserPassword);

router.delete("/users", isAuthenticated, UserController.deleteUser);

router.post("/users/photo", isAuthenticated, upload.single("image"), UserController.updateImage);

module.exports = router;