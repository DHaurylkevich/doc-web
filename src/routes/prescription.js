const express = require("express");
const prescriptionController = require("../controllers/prescriptionController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { validateBody } = require("../utils/validation");
const { validateRequest } = require("../middleware/errorHandler")
const router = express.Router();

/**
 * @swagger
 * /prescriptions:
 *   post:
 *     summary: Создание нового рецепта для пациента
 *     tags: [Prescriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: integer
 *                 description: ID пациента
 *               medicationsIds:
 *                 type: array
 *                 description: IDs лекарств
 *                 items:
 *                   type: integer
 *               expirationDate:
 *                 type: string
 *                 format: date
 *                 description: Дата истечения срока действия рецепта
 *             required:
 *               - patientId
 *               - doctorId
 *               - medicationId
 *               - expirationDate
 *     responses:
 *       201:
 *         description: Рецепт успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category deleted successfully"
 */
router.post("/prescriptions", validateBody("expirationDate"), validateRequest, isAuthenticated, hasRole("doctor"), prescriptionController.createPrescription);
/**
 * @swagger
 * /prescriptions:
 *   get:
 *     summary: Получение всех рецептов, назначенных доктором
 *     tags: [Prescriptions]
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
 *                       name:
 *                         type: string
 *                         example: "Luxurious Metal Ball"
 *       400:
 *         description: Ошибка получения рецептов
 */
router.get("/prescriptions", isAuthenticated, hasRole(["doctor", "patient"]), prescriptionController.getPrescriptions);

module.exports = router;