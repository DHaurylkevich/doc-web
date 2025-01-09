const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/categoryController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { validateBody } = require("../utils/validation");
const { validateRequest } = require("../middleware/errorHandler");

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Создать новую категории
 *     description: Создает новую категорию с заданными данными для постов.
 *     tags: [Categories]
 *     requestBody:
 *       description: Данные для создания категории
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Название категории"
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Успешно создана запись
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Название категории"
 */
router.post("/categories", validateBody("name"), validateRequest, isAuthenticated, hasRole("admin"), CategoryController.createCategory);
/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Получить все категории
 *     description: Возвращает список всех категорий.
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Массив всех категорий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Название категории"
 */
router.get("/categories", CategoryController.getAllCategories);
/**
 * @swagger
 * /categories/{categoryId}:
 *   put:
 *     summary: Обновить категорию
 *     description: Обновляет существующую категорию по ее ID.
 *     tags: [Categories]
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         description: ID категории
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       description: Обновленные данные категории
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                name:
 *                 type: string
 *                 example: "Категория"
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Категория успешно обновлена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Название категории"
 */
router.put("/categories/:categoryId", validateBody("name"), validateRequest, isAuthenticated, hasRole("admin"), CategoryController.updateCategory);
/**
 * @swagger
 * /categories/{categoryId}:
 *   delete:
 *     summary: Удалить категорию
 *     description: Удаляет категорию по заданному ID.
 *     tags: [Categories]
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         description: ID категории для удаления
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Категория успешно удалена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category deleted successfully"
 */
router.delete("/categories/:categoryId", isAuthenticated, hasRole("admin"), CategoryController.deleteCategory);

module.exports = router; 