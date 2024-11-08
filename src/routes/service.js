const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");

/**
 * @swagger
 * /clinic/{clinicId}/services:
 *   post:
 *     summary: Создать новую услугу
 *     description: Создает новую услугу связанную с специализанией для клиники.
 *     tags:
 *       - Notions
 *     parameters:
 *       - name: clinicId
 *         in: path
 *         required: true
 *         description: ID клиник которая создает услугу
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       description: Данные для создания услуги
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Название услуги"
 *               specialtyId:
 *                 type: number
 *                 example: 1
 *               price:
 *                 type: number
 *                 example: 10.20
 *             required:
 *               - name
 *               - specialtyId
 *               - price
 *     responses:
 *       201:
 *         description: Успешно создана услуга
 */
router.post("/clinic/:clinicId/services", serviceController.createService);
/**
 * @swagger
 * /services:
 *   get:
 *     summary: Получить все услуги
 *     description: Возвращает список всех услуг.
 *     tags:
 *       - Services
 *     responses:
 *       200:
 *         description: Массив всех услуг
 */
router.get("/services", serviceController.getAllServices);
/**
 * @swagger
 * /services/{serviceId}:
 *   get:
 *     summary: Получить все услуги
 *     description: Возвращает список всех услуг.
 *     tags:
 *       - Services
 *     parameters:
 *       - name: serviceId
 *         in: path
 *         required: true
 *         description: ID услуги для удаления
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Массив всех услуг
 */
router.get("/services/:serviceId", serviceController.getService);
/**
 * @swagger
 * /services/{serviceId}:
 *   put:
 *     summary: Обновить услугу
 *     description: Обновляет существующую услугу по ее ID.
 *     tags:
 *       - Services
 *     parameters:
 *       - name: serviceId
 *         in: path
 *         required: true
 *         description: ID услуги
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       description: Обновленные данные услуги
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Название услуги"
 *               specialtyId:
 *                 type: number
 *                 example: 1
 *               price:
 *                 type: number
 *                 example: 10.20
 *     responses:
 *       200:
 *         description: Услуга успешно обновлена
 */
router.put("/services/:serviceId", serviceController.updateService);
/**
 * @swagger
 * /services/{serviceId}:
 *   delete:
 *     summary: Удалить услугу
 *     description: Удаляет услугу по заданному ID.
 *     tags:
 *       - Services
 *     parameters:
 *       - name: serviceId
 *         in: path
 *         required: true
 *         description: ID услуги для удаления
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Услуга успешно удалена
 */
router.delete("/services/:serviceId", serviceController.deleteService);

module.exports = router;