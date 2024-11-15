const express = require("express");
const MedicationController = require("../controllers/medicationController");
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
router.post("/medications", MedicationController.createMedication);

/**
 * @swagger
 * /medications/{medicationsId}:
 *   get:
 *     summary: Получить лекарство по ID
 *     tags:
 *       - Medications
 *     parameters:
 *       - in: path
 *         name: medicationsId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лекарства
 *     responses:
 *       200:
 *         description: Информация о лекарстве
 */
router.get("/medications/:medicationsId", MedicationController.getMedicationById);

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
router.get("/medications", MedicationController.getAllMedications);

/**
 * @swagger
 * /medications/{medicationsId}:
 *   put:
 *     summary: Обновить информацию о лекарстве
 *     tags:
 *       - Medications
 *     parameters:
 *       - in: path
 *         name: medicationsId
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
 *               description:
 *                 type: string
 *                 example: "Anti-inflammatory"
 *               dosage:
 *                 type: string
 *                 example: "200mg"
 *     responses:
 *       200:
 *         description: Лекарство успешно обновлено
 */
router.put("/medications/:medicationsId", MedicationController.updateMedication);

/**
 * @swagger
 * /medications/{medicationsId}:
 *   delete:
 *     summary: Удалить лекарство
 *     tags: 
 *       - Medications
 *     parameters:
 *       - in: path
 *         name: medicationsId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID лекарства
 *     responses:
 *       200:
 *         description: Лекарство успешно удалено
 */
router.delete("medications/:medicationsId", MedicationController.deleteMedication);

module.exports = router;
