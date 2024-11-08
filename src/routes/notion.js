const express = require("express");
const router = express.Router();
const NotionController = require("../controllers/notionController");
/**
 * @swagger
 * paths:
 *   /notions:
 *     post:
 *       summary: Создать новую запись
 *       description: Создает новую запись с заданными данными.
 *       operationId: createNotion
 *       tags:
 *         - Notions
 *       requestBody:
 *         description: Данные для создания записи
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                   example: "Содержание записи"
 *               required:
 *                 - content
 *       responses:
 *         201:
 *           description: Успешно создана запись
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
 *                     example: "Содержание записи"
 *         400:
 *           description: Неверные данные запроса
 *         500:
 *           description: Внутренняя ошибка сервера
 */
router.post("/notions", NotionController.createNotion);

/**
 * @swagger
 * paths:
 *   /notions:
 *     get:
 *       summary: Получить все записи
 *       description: Возвращает список всех записей.
 *       operationId: getAllNotions
 *       tags:
 *         - Notions
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
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Название записи"
 *                     content:
 *                       type: string
 *                       example: "Содержание записи"
 *         500:
 *           description: Внутренняя ошибка сервера
 */
router.get("/notions", NotionController.getAllNotions);
/**
 * @swagger
 * paths:
 *    /notions/{notionId}:
 *     put:
 *       summary: Обновить запись
 *       description: Обновляет существующую запись по ее ID.
 *       operationId: updateNotion
 *       tags:
 *         - Notions
 *       parameters:
 *         - name: notionId
 *           in: path
 *           required: true
 *           description: ID записи
 *           schema:
 *             type: integer
 *             example: 1
 *       requestBody:
 *         description: Обновленные данные записи
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: "Обновленное название записи"
 *                 content:
 *                   type: string
 *                   example: "Обновленное содержание записи"
 *               required:
 *                 - title
 *                 - content
 *       responses:
 *         200:
 *           description: Запись успешно обновлена
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: "Обновленное название записи"
 *                   content:
 *                     type: string
 *                     example: "Обновленное содержание записи"
 *         404:
 *           description: Запись не найдена
 *         500:
 *           description: Внутренняя ошибка сервера
 */
router.put("/notions/:notionId", NotionController.updateNotion);
/**
 * @swagger
 * paths:
 *   /notions:
 *    delete:
 *       summary: Удалить запись
 *       description: Удаляет запись по заданному ID.
 *       operationId: deleteNotion
 *       tags:
 *         - Notions
 *       parameters:
 *         - name: notionId
 *           in: path
 *           required: true
 *           description: ID записи для удаления
 *           schema:
 *             type: integer
 *             example: 1
 *       responses:
 *         200:
 *           description: Запись успешно удалена
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "Successful delete"
 *         404:
 *           description: Запись не найдена
 *         500:
 *           description: Внутренняя ошибка сервера
 */
router.delete("/notions/:notionId", NotionController.deleteNotion);

module.exports = router; 