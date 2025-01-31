const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/categoryController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { validateBody } = require("../utils/validation");
const { validateRequest } = require("../middleware/errorHandler");

router.post("/categories", validateBody("name"), validateRequest, isAuthenticated, hasRole("admin"), CategoryController.createCategory);

router.get("/categories", CategoryController.getAllCategories);

router.put("/categories/:categoryId", validateBody("name"), validateRequest, isAuthenticated, hasRole("admin"), CategoryController.updateCategory);

router.delete("/categories/:categoryId", isAuthenticated, hasRole("admin"), CategoryController.deleteCategory);

module.exports = router; 