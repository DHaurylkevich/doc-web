const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { serviceCreateValidation } = require('../utils/validation');
const { validateRequest } = require('../middleware/errorHandler');

/**
 * @swagger
 * /clinics/services:
 *   post:
 *     summary: Создать новую услугу
 *     description: Создает новую услугу связанную с специализанией для клиники
 *     tags: [Services]
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
 *                   example: "Название сервиса"
 *                 price:
 *                   type: string
 *                   example: "10.10"
 */
router.post("/clinics/services", serviceCreateValidation, validateRequest, isAuthenticated, hasRole("clinic"), serviceController.createService);
/**
 * @swagger
 * /clinics/{clinicId}/services:
 *   get:
 *     summary: Получить все услуги определенной клиники
 *     tags: [Services]
 *     parameters:
 *       - name: clinicId
 *         in: path
 *         required: true
 *         description: ID клиник
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Массив всех услуг
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
 *                     example: "Название сервиса"
 *                   price:
 *                     type: string
 *                     example: "10.10"
 */
router.get("/clinics/:clinicId/services", serviceController.getServicesByClinic);
/**
 * @swagger
 * /services/{serviceId}:
 *   get:
 *     summary: Получить услугу по id
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
 *     responses:
 *       200:
 *         description: Услуга по заданному id
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
 *                   example: "Название услуги"
 *                 price:
 *                   type: string
 *                   example: "10.10"
 */
router.get("/services/:serviceId", serviceController.getServiceById);
/**
 * @swagger
 * /doctors/{doctorId}/services:
 *   get:
 *     summary: Получить услугу по doctorId
 *     tags:
 *       - Services
 *     parameters:
 *       - name: doctorId
 *         in: path
 *         required: true
 *         description: ID доктора
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Услуги по заданному doctorId
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   service:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Название услуги"
 *                       price:
 *                         type: integer
 *                         example: 16.23
 */
router.get("/doctors/:doctorId/services", serviceController.getServicesByDoctor);
/**
 * @swagger
 * /services/{serviceId}:
 *   put:
 *     summary: Обновить услугу по ее id
 *     tags: [Services]
 *     security:
 *       - CookieAuth: []
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
 *                   example: "Название услуги"
 *                 price:
 *                   type: string
 *                   example: "10.10"
 */
router.put("/services/:serviceId", isAuthenticated, hasRole("clinic"), serviceController.updateService);
/**
 * @swagger
 * /services/{serviceId}:
 *   delete:
 *     summary: Удалить услугу
 *     description: Удаляет услугу по заданному ID.
 *     tags:
 *       - Services
 *     security:
 *       - CookieAuth: []
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Service deleted successfully"
 */
router.delete("/services/:serviceId", isAuthenticated, hasRole("clinic"), serviceController.deleteService);

module.exports = router;