const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/login", userController.loginUser);

router.get("/:id", userController.getUserByIdAndRole);

router.put("/password/:id", userController.updateUserPassword);

router.delete("/:id", userController.deleteUser);

module.exports = router;