const express = require("express");
const router = express.Router();
const NotionController = require("../controllers/notionController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { validateBody } = require("../utils/validation");
const { validateRequest } = require("../middleware/errorHandler")

/**
 * @swagger
 * paths:
 *   /notions:
 *     post:
 *       summary: Создать новую записку
 *       description: Создает новую записку для админа.
 *       operationId: createNotion
 *       tags: [Notions]
 *       requestBody:
 *         description: Данные для создания записки
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                   example: "Текст записки"
 *               required:
 *                 - content
 *       responses:
 *         201:
 *           description: Успешно создана записка
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   content:
 *                     type: string
 *                     example: "Текст записки"
 *         400:
 *           description: Неверные данные запроса
 */
router.post("/notions", validateBody("content"), validateRequest, isAuthenticated, hasRole("admin"), NotionController.createNotion);
/**
 * @swagger
 * paths:
 *   /notions:
 *     get:
 *       summary: Получить все записи
 *       description: Возвращает список всех записей.
 *       operationId: getAllNotions
 *       tags: [Notions]
 *       responses:
 *         200:
 *           description: Массив всех записей
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     content:
 *                       type: string
 *                       example: "Содержание записи"
 */
router.get("/notions", isAuthenticated, hasRole("admin"), NotionController.getAllNotions);
/**
 * @swagger
 * paths:
 *    /notions/{notionId}:
 *     put:
 *       summary: Обновить запись
 *       description: Обновляет существующую записку по ее ID.
 *       operationId: updateNotion
 *       tags: [Notions]
 *       parameters:
 *         - name: notionId
 *           in: path
 *           required: true
 *           description: ID записки
 *           schema:
 *             type: integer
 *             example: 1
 *       requestBody:
 *         description: Обновленные данные записки
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                   example: "Обновленное содержание записки"
 *               required:
 *                 - content
 *       responses:
 *         200:
 *           description: Записка успешно обновлена
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   content:
 *                     type: string
 *                     example: "Обновленное содержание записки"
 *         404:
 *           description: Запись не найдена
 */
router.put("/notions/:notionId", validateBody("content"), validateRequest, isAuthenticated, hasRole("admin"), NotionController.updateNotion);
/**
 * @swagger
 * paths:
 *   /notions/{notionId}:
 *    delete:
 *       summary: Удалить записку
 *       description: Удаляет записку по заданному ID.
 *       operationId: deleteNotion
 *       tags: [Notions]
 *       parameters:
 *         - name: notionId
 *           in: path
 *           required: true
 *           description: ID записки для удаления
 *           schema:
 *             type: integer
 *             example: 1
 *       responses:
 *         200:
 *           description: Записка успешно удалена
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Notion successful delete"
 *         404:
 *           description: Записка не найдена
 */
router.delete("/notions/:notionId", isAuthenticated, hasRole("admin"), NotionController.deleteNotion);

module.exports = router; 