const express = require("express");
const router = express.Router();
const TagController = require("../controllers/tagController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { validateBody } = require("../utils/validation");
const { validateRequest } = require("../middleware/errorHandler");

/**
 * @swagger
 * /tags:
 *   post:
 *     summary: Создает новый тэг
 *     tags:[Tags]
 *     requestBody:
 *       description: Данные для создания тэга
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Название тэга"
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Успешное созданае тэга
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Название категории"
 *                 positive:
 *                   type: boolean
 *                   example: true
 */
router.post("/tags", validateBody("name"), validateRequest, isAuthenticated, hasRole("admin"), TagController.createTag);
/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Получить все тэги
 *     description: Возвращает список всех тэгов.
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Массив всех тэгов
 */
router.get("/tags", isAuthenticated, TagController.getAllTags);
/**
 * @swagger
 * /tags/{tagId}:
 *   put:
 *     summary: Обновить тэг
 *     description: Обновляет существующый тэг по его ID.
 *     tags: [Tags]
 *     parameters:
 *       - name: tagId
 *         in: path
 *         required: true
 *         description: ID тэга
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       description: Обновленные данные тэга
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Обновленный тэг"
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Тэг успешно обновлен
 */
router.put("/tags/:tagId", isAuthenticated, hasRole("admin"), TagController.updateTag);
/**
 * @swagger
 * /tags/{tagId}:
 *   delete:
 *     summary: Удалить тэг
 *     description: Удаляет тэг по заданному ID.
 *     tags: [Tags]
 *     parameters:
 *       - name: tagId
 *         in: path
 *         required: true
 *         description: ID тэга для удаления
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Таг успешно удален
 */
router.delete("/tags/:tagId", isAuthenticated, hasRole("admin"), TagController.deleteTag);

module.exports = router;