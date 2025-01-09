const express = require("express");
const MedicationController = require("../controllers/medicationController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { validateBody } = require("../utils/validation");
const { validateRequest } = require("../middleware/errorHandler");
const router = express.Router();

/**
 * @swagger
 * /medications:
 *   post:
 *     summary: Создать новое лекарство
 *     tags:
 *       - Medications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Aspirin"
 *     responses:
 *       201:
 *         description: Лекарство успешно создано
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
 *                   example: "Aspirin"
 */
router.post("/medications", validateBody("name"), validateRequest, isAuthenticated, hasRole("admin"), MedicationController.createMedication);

// /**
//  * @swagger
//  * /medications/{medicationId}:
//  *   get:
//  *     summary: Получить лекарство по ID
//  *     tags:
//  *       - Medications
//  *     parameters:
//  *       - in: path
//  *         name: medicationId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: ID лекарства
//  *     responses:
//  *       200:
//  *         description: Информация о лекарстве
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                 properties:
//  *                   id:
//  *                     type: integer
//  *                     example: 1
//  *                   name:
//  *                     type: string
//  *                     example: "Aspirin"
//  */
// router.get("/medications/:medicationId", isAuthenticated, MedicationController.getMedicationById);

/**
 * @swagger
 * /medications:
 *   get:
 *     summary: Получить все лекарства
 *     tags:
 *       - Medications
 *     responses:
 *       200:
 *         description: Список лекарств
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
 *                     example: "Aspirin"
 */
router.get("/medications", isAuthenticated, MedicationController.getAllMedications);
/**
 * @swagger
 * /medications/{medicationId}:
 *   put:
 *     summary: Обновить информацию о лекарстве
 *     tags:
 *       - Medications
 *     parameters:
 *       - in: path
 *         name: medicationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лекарства
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ibuprofen"
 *     responses:
 *       200:
 *         description: Лекарство успешно обновлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Aspirin"
 */
router.put("/medications/:medicationId", validateBody("name"), validateRequest, isAuthenticated, hasRole("admin"), MedicationController.updateMedication);
/**
 * @swagger
 * /medications/{medicationId}:
 *   delete:
 *     summary: Удалить лекарство
 *     tags: 
 *       - Medications
 *     parameters:
 *       - in: path
 *         name: medicationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лекарства
 *     responses:
 *       200:
 *         description: Лекарство успешно удалено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Medication deleted successfully"
 */
router.delete("/medications/:medicationId", isAuthenticated, hasRole("admin"), MedicationController.deleteMedication);

module.exports = router;