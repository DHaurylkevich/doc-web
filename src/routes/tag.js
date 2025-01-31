const express = require("express");
const router = express.Router();
const TagController = require("../controllers/tagController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { validateBody } = require("../utils/validation");
const { validateRequest } = require("../middleware/errorHandler");

router.post("/tags", validateBody("name"), validateRequest, isAuthenticated, hasRole("admin"), TagController.createTag);

router.get("/tags", isAuthenticated, TagController.getAllTags);

router.put("/tags/:tagId", isAuthenticated, hasRole("admin"), TagController.updateTag);

router.delete("/tags/:tagId", isAuthenticated, hasRole("admin"), TagController.deleteTag);

module.exports = router;