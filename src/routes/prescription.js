const express = require("express");
const prescriptionController = require("../controllers/prescriptionController");
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
router.post("/prescriptions", prescriptionController.createPrescription);

/**
 * @swagger
 * /patient/{patientId}/prescriptions:
 *   get:
 *     summary: Получение всех рецептов пациента
 *     tags:
 *       - Prescriptions
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пациента
 *     responses:
 *       200:
 *         description: Список рецептов пациента
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
 *                   doctor_id:
 *                     type: integer
 *                     example: 3
 *                   medication_id:
 *                     type: integer
 *                     example: 2
 *       400:
 *         description: Ошибка получения рецептов
 */
router.get("/patient/:patientId/prescriptions", prescriptionController.getPrescriptionsByPatient);

/**
 * @swagger
 * /doctors/{doctorId}/prescriptions:
 *   get:
 *     summary: Получение всех рецептов, назначенных доктором
 *     tags:
 *       - Prescriptions
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID доктора
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
 *                   doctor_id:
 *                     type: integer
 *                     example: 3
 *                   medication_id:
 *                     type: integer
 *                     example: 2
 *       400:
 *         description: Ошибка получения рецептов
 */
router.get("/doctors/:doctorId/prescriptions", prescriptionController.getPrescriptionsByDoctor);

module.exports = router;
