const express = require("express");
const router = express.Router();
const PostController = require("../controllers/postController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Создать новый пост
 *     description: Создает новый пост с заданными данными.
 *     tags:
 *       - Posts
 *     requestBody:
 *       description: Данные для создания поста
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 example: "Фото для поста"
 *               title:
 *                 type: string
 *                 example: "Заглавие для поста"
 *               content:
 *                 type: string
 *                 example: "Содержание поста"
 *             required:
 *               - photo
 *               - title
 *               - content
 *     responses:
 *       201:
 *         description: Успешное создана поста
 */
router.post("/posts/categories/:categoryId", isAuthenticated, hasRole("admin"), PostController.createPost);
/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Получить все посты
 *     description: Возвращает список всех постов.
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: Массив всех постов
 */
router.get("/posts", PostController.getAllPosts);
/**
 * @swagger
 * /posts/categories/{categoryId}:
 *   get:
 *     summary: Получить все посты по категории
 *     description: Возвращает список всех постов определенной категории.
 *     tags:
 *       - Posts
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         description: ID категории
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Массив всех постов по категории 
 */
router.get("/posts/categories/:categoryId", PostController.getPostsByCategory);
/**
 * @swagger
 * /posts/{postId}:
 *   put:
 *     summary: Обновить пост
 *     description: Обновляет существующуй пост по его ID.
 *     tags:
 *       - Posts
 *     parameters:
 *       - name: postsId
 *         in: path
 *         required: true
 *         description: ID поста
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       description: Обновленные данные поста
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 example: "Обновленное название записи"
 *               title:
 *                 type: string
 *                 example: "Обновленное название записи"
 *               content:
 *                 type: string
 *                 example: "Обновленное содержание записи"
 *             required:
 *               - photo
 *               - title
 *               - content
 *     responses:
 *       200:
 *         description: Пост успешно обновлена
 */
router.put("/posts/:postId", isAuthenticated, hasRole("admin"), PostController.updatePost);
/**
 * @swagger
 *  /post/{postId}:
 *   delete:
 *     summary: Удалить пост
 *     description: Удаляет пост по заданному ID.
 *     tags:
 *       - Posts
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: ID поста для удаления
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Пост успешно удалена
 */
router.delete("/posts/:postId", isAuthenticated, hasRole("admin"), PostController.deletePost);

module.exports = router; 