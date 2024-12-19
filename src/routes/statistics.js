const express = require("express");
const router = express.Router();
const StatisticController = require("../controllers/statisticController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

/**
 * @swagger
 * /doctors/statistics:
 *   get:
 *     summary: Получение общего количества пациентов DOCTOR
 *     description: Возвращает общее количество пациентов в системе
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Успешное получение количества пациентов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Общее количество пациентов
 *                   example: 100
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об ошибке
 *                   example: "Внутренняя ошибка сервера"
 */
router.get("/doctors/statistics", isAuthenticated, hasRole("doctor"), StatisticController.getDoctorStatistics);
/**
 * @swagger
 * /clinics/statistics:
 *   get:
 *     summary: Получение общего количества пациентов CLINIC
 *     description: Возвращает общее количество пациентов в системе
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Успешное получение количества пациентов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Общее количество пациентов
 *                   example: 100
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об ошибке
 *                   example: "Внутренняя ошибка сервера"
 */
router.get("/clinics/statistics", isAuthenticated, hasRole("clinic"), StatisticController.getClinicStatistics);

module.exports = router;