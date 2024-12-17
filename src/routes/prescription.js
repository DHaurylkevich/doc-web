const express = require("express");
const prescriptionController = require("../controllers/prescriptionController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const router = express.Router();


/**
 * @swagger
 * /prescriptions:
 *   post:
 *     summary: Создание нового рецепта для пациента
 *     tags:
 *       - Prescriptions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - doctorId
 *               - medicationId
 *             properties:
 *               patientId:
 *                 type: integer
 *                 description: ID пациента
 *               doctorId:
 *                 type: integer
 *                 description: ID доктора
 *               medicationId:
 *                 type: integer
 *                 description: ID лекарства
 *     responses:
 *       201:
 *         description: Рецепт успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 prescription:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     code:
 *                       type: string
 *                       example: "4f7b3d92d6"
 *                     expiration_date:
 *                       type: string
 *                       format: date
 *                       example: "2024-12-31"
 *                     patient_id:
 *                       type: integer
 *                       example: 5
 *                     doctor_id:
 *                       type: integer
 *                       example: 3
 *                     medication_id:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Ошибка валидации данных
 */
router.post("/prescriptions", isAuthenticated, hasRole("doctor"), prescriptionController.createPrescription);
/**
 * @swagger
 * /prescriptions:
 *   get:
 *     summary: Получение всех рецептов, назначенных доктором
 *     tags:
 *       - Prescriptions
 *     parameters:
 *       - name: sort
 *         in: query
 *         required: false
 *         description: Сортировка по рейтингу (ASC или DESC)
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Лимит на количество результатов
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: page
 *         in: query
 *         required: false
 *         description: Номер страницы
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Список рецептов, назначенных доктором
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
 *                   code:
 *                     type: string
 *                     example: "4f7b3d92d6"
 *                   expiration_date:
 *                     type: string
 *                     format: date
 *                     example: "2024-12-31"
 *                   patient_id:
 *                     type: integer
 *                     example: 5
 *                   patient:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                         example: 1
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                             example: 1
 *                           first_name:
 *                             type: string
 *                             example: "Zora"
 *                           last_name:
 *                             type: string
 *                             example: "Lemke"
 *                           photo:
 *                             type: string
 *                             example: "https://example.com"
 *                   medications:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Luxurious Metal Ball"
 *       400:
 *         description: Ошибка получения рецептов
 */
router.get("/prescriptions", isAuthenticated, prescriptionController.getPrescriptions);

module.exports = router;
