const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/categoryController");

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Создать новую категории
 *     description: Создает новую категорию с заданными данными.
 *     tags:
 *       - Categories
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
 */
router.post("/categories", CategoryController.createCategory);
/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Получить все категории
 *     description: Возвращает список всех категорий.
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: Массив всех категорий
 */
router.get("/categories", CategoryController.getAllCategories);
/**
 * @swagger
 * /categories/{categoryId}:
 *   put:
 *     summary: Обновить категорию
 *     description: Обновляет существующую категорию по ее ID.
 *     tags:
 *       - Categories
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
 */
router.put("/categories/:categoryId", CategoryController.updateCategory);
/**
 * @swagger
 * /categories/{categoryId}:
 *   delete:
 *     summary: Удалить категорию
 *     description: Удаляет категорию по заданному ID.
 *     tags:
 *       - Categories 
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
 */
router.delete("/categories/:categoryId", CategoryController.deleteCategory);

module.exports = router; 