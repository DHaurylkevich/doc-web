const express = require("express");
const router = express.Router();
const specialtyController = require("../controllers/specialtyController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

/**
 * @swagger
 * paths:
 *  /specialties:
 *    post:
 *      summary: Создает специальность, делает только админ
 *      description: Создает новую специальность при корректных данных и роли администратора
 *      operationId: createSpecialty
 *      security:
 *        - CookieAuth: []
 *      tags: [Specialties]
 *      requestBody:
 *        description: Данные для создания специальности
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                 name:
 *                   type: string
 *                   example: "хирург"
 *                   description: Название специальности
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
 */
router.post("/specialties", isAuthenticated, hasRole('admin'), specialtyController.createSpecialty);
/**
 * @swagger
 * paths:
 *  /specialties:
 *    get:
 *      summary: Получить все специальности без услуг
 *      operationId: getAllSpecialties
 *      tags: [Specialties]
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
 */
router.get("/specialties", specialtyController.getAllSpecialties);
/**
 * @swagger
 * paths:
 *  /clinic/{clinicId}/specialties:
 *    get:
 *      summary: Получить все специальности и все услуги связанные с клиникой
 *      tags: [Specialties]
 *      parameters:
 *       - name: clinicId
 *         in: path
 *         required: true
 *         description: ID клиники для удаления
 *         schema:
 *           type: integer
 *           example: 1
 *      responses:
 *        200:
 *          description: Массив всех специальностей и сервисов
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
 *                    services:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          id:
 *                            type: integer
 *                            example: 1
 *                          name:
 *                            type: string
 *                            example: "Название услуги"
 *                    createdAt:
 *                      type: string
 *                      format: date-time
 *                      example: "2024-10-31T20:29:46.000Z"
 *                    updatedAt:
 *                      type: string
 *                      format: date-time
 *                      example: "2024-10-31T20:29:46.000Z"
 */
router.get("/clinic/:clinicId/specialties", specialtyController.getAllSpecialtiesByClinic);
/**
 * @swagger
 * /specialties/{specialtyId}:
 *   get:
 *     summary: Получить специализацию
 *     description: Возвращает специализацию по заданому ID.
 *     tags: [Specialties]
 *     parameters:
 *       - name: specialtyId
 *         in: path
 *         required: true
 *         description: ID специальности для удаления
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Специализация
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
 *                   example: "Хирург"
 */
router.get("/specialties/:specialtyId", specialtyController.getSpecialty);
/**
 * @swagger
 * /specialties/{specialtyId}:
 *   put:
 *     summary: Обновить специальность
 *     description: Обновляет существующую специальность по ее ID.
 *     tags: [Specialties]
 *     parameters:
 *       - name: specialtyId
 *         in: path
 *         required: true
 *         description: ID специальности
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       description: Обновленные данные специальности
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Обновленное содержание специальности"
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Специальность успешно обновлена
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
 *                   example: "Хирург"
 */
router.put("/specialties/:specialtyId", isAuthenticated, hasRole('admin'), specialtyController.updateSpecialty);
/**
 * @swagger
 * /specialties/{specialtyId}:
 *   delete:
 *     summary: Удалить специальность
 *     description: Удаляет специальность по заданному ID.
 *     tags: [Specialties]
 *     parameters:
 *       - name: specialtyId
 *         in: path
 *         required: true
 *         description: ID специальности для удаления
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Специальность успешно удалена
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Specialty deleted successfully"
 */
router.delete("/specialties/:specialtyId", isAuthenticated, hasRole('admin'), specialtyController.deleteSpecialty);

module.exports = router;