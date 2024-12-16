const express = require("express");
const MedicationController = require("../controllers/medicationController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
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
 */
router.post("/medications", isAuthenticated, hasRole("admin"), MedicationController.createMedication);
/**
 * @swagger
 * /medications/{medicationId}:
 *   get:
 *     summary: Получить лекарство по ID
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
 *         description: Информация о лекарстве
 */
router.get("/medications/:medicationId", isAuthenticated, MedicationController.getMedicationById);
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
 */
router.put("/medications/:medicationId", isAuthenticated, hasRole("admin"), MedicationController.updateMedication);
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
 */
router.delete("/medications/:medicationId", isAuthenticated, hasRole("admin"), MedicationController.deleteMedication);

module.exports = router;
