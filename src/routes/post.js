const express = require("express");
const router = express.Router();
const PostController = require("../controllers/postController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

router.post("/posts/categories/:categoryId", isAuthenticated, hasRole("admin"), PostController.createPost);

router.get("/posts", PostController.getAllPosts);

router.get("/posts/categories/:categoryId", PostController.getPostsByCategory);

router.put("/posts/:postId", isAuthenticated, hasRole("admin"), PostController.updatePost);

router.delete("/posts/:postId", isAuthenticated, hasRole("admin"), PostController.deletePost);

module.exports = router; 