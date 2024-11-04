const express = require("express");
const router = express.Router();
const TagController = require("../controllers/tagController");
/**
 * @swagger
 * paths:
 *  /specialty:
 *    post:
 *      summary: Создает специальность
 *      description: Создает новую специальность при корректных данных и роли администратора
 *      operationId: createSpecialty
 *      tags:
 *        - Tags
 *      requestBody:
 *        description: Данные для создания специальности
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                specialtyData:
 *                  type: object
 *                  description: Объект данных специальности
 *                  properties:
 *                    name:
 *                      type: string
 *                      example: "хирург"
 *                      description: Название специальности
 *      responses:
 *        201:
 *          description: Успешное создание специальности
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: integer
 *                    example: 1
 *                  name:
 *                    type: string
 *                    example: "Хирург"
 *        400:
 *          description: Неверные данные запроса
 *        401:
 *          description: Ошибка авторизации - требуется роль администратора
 *        404:
 *          description: Специальность не найдена
 */
router.post("/tags", TagController.createTag);
/**
 * @swagger
 * paths:
 *  /specialty:
 *    get:
 *      summary: Получить все специальности без услуг
 *      operationId: getAllSpecialties
 *      tags:
 *        - Tags
 *      responses:
 *        200:
 *          description: Массив всех специальностей
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: integer
 *                      example: 1
 *                    name:
 *                      type: string
 *                      example: "Хирург"
 *                    createdAt:
 *                      type: string
 *                      format: date-time
 *                      example: "2024-10-31T20:29:46.000Z"
 *                    updatedAt:
 *                      type: string
 *                      format: date-time
 *                      example: "2024-10-31T20:29:46.000Z"
 *        400:
 *          description: Неверные данные запроса
 *        401:
 *          description: Ошибка авторизации - требуется роль администратора
 *        404:
 *          description: Специальности не найдены
 */
router.get("/tags", TagController.getAllTags);
/**
 * @swagger
 * paths:
 *  /specialty/:id:
 *    put:
 *      summary: Создает специальность
 *      description: Создает новую специальность при корректных данных и роли администратора
 *      operationId: createSpecialty
 *      tags:
 *        - Tags
 *      requestBody:
 *        description: Данные для создания специальности
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                specialtyData:
 *                  type: object
 *                  description: Объект данных специальности
 *                  properties:
 *                    name:
 *                      type: string
 *                      example: "хирург"
 *                      description: Название специальности
 *      responses:
 *        200:
 *          description: Успешное создание специальности
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: integer
 *                    example: 1
 *                  name:
 *                    type: string
 *                    example: Хирург
 *        400:
 *          description: Неверные данные запроса
 *        401:
 *          description: Ошибка авторизации - требуется роль администратора
 *        404:
 *          description: Специальность не найдена
*/
router.put("/tags/:tagId", TagController.updateTag);
/**
 * @swagger
 * paths:
 *  /specialty/:id:
 *    delete:
 *      summary: Создает специальность
 *      description: Создает новую специальность при корректных данных и роли администратора
 *      operationId: createSpecialty
 *      tags:
 *        - Tags
 *      requestBody:
 *        description: Данные для создания специальности
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                specialtyData:
 *                  type: object
 *                  description: Объект данных специальности
 *                  properties:
 *                    name:
 *                      type: string
 *                      example: "хирург"
 *                      description: Название специальности
 *      responses:
 *        200:
 *          description: Успешное создание специальности
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: integer
 *                    example: 1
 *                  name:
 *                    type: string
 *                    example: Хирург
 *        400:
 *          description: Неверные данные запроса
 *        401:
 *          description: Ошибка авторизации - требуется роль администратора
 *        404:
 *          description: Специальность не найдена
*/
router.delete("/tags/:tagId", TagController.deleteTag);

module.exports = router;