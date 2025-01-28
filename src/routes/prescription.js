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
 *     responses:
 *       200:
 *         description: Список рецептов, назначенных доктором
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pages:
 *                   type: integer
 *                   example: 3
 *                 prescriptions:
 *                   type: object
 *                   properties:
 *                     active:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 11
 *                           expiration_date:
 *                             type: string
 *                             format: date-time
 *                             example: "2026-01-07T10:50:01.587Z"
 *                           status:
 *                             type: string
 *                             example: "active"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-01-27T17:29:25.487Z"
 *                           patient:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 12
 *                               user:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                     example: 32
 *                                   first_name:
 *                                     type: string
 *                                     example: "Gertruda"
 *                                   last_name:
 *                                     type: string
 *                                     example: "Puchalski"
 *                                   photo:
 *                                     type: string
 *                                     example: "https://avatars.githubusercontent.com/u/28493244"
 *                           medications:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                   example: "Practical Plastic Gloves"
 *                     inactive:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 2
 *                           expiration_date:
 *                             type: string
 *                             format: date-time
 *                             example: null
 *                           status:
 *                             type: string
 *                             example: "inactive"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-01-27T17:29:25.486Z"
 *                           patient:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 2
 *                               user:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                     example: 12
 *                                   first_name:
 *                                     type: string
 *                                     example: "Kleopatra"
 *                                   last_name:
 *                                     type: string
 *                                     example: "Majcher"
 *                                   photo:
 *                                     type: string
 *                                     example: "https://avatars.githubusercontent.com/u/58501218"
 *                           medications:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                   example: "Bespoke Steel Fish"
 */
router.get("/prescriptions", isAuthenticated, hasRole(["doctor", "patient"]), prescriptionController.getPrescriptions);

module.exports = router;