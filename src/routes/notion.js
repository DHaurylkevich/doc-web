const express = require("express");
const router = express.Router();
const NotionController = require("../controllers/notionController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { validateBody } = require("../utils/validation");
const { validateRequest } = require("../middleware/errorHandler")

router.post("/notions", validateBody("content"), validateRequest, isAuthenticated, hasRole("admin"), NotionController.createNotion);

router.get("/notions", isAuthenticated, hasRole("admin"), NotionController.getAllNotions);

router.put("/notions/:notionId", validateBody("content"), validateRequest, isAuthenticated, hasRole("admin"), NotionController.updateNotion);

router.delete("/notions/:notionId", isAuthenticated, hasRole("admin"), NotionController.deleteNotion);

module.exports = router;