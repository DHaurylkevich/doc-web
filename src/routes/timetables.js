const express = require("express");
const router = express.Router();
const TimetableController = require("../controllers/timetableController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

/**
 * @swagger
 * /clinics/timetable:
 *   put:
 *     summary: Обновить расписание
 *     description: Обновляет существующие рассписания клиники
 *     tags:
 *       - Timetable
 *     requestBody:
 *       description: Обновленные данные графика для клиники
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timetablesData:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     dayOfWeek:
 *                       type: integer
 *                       example: 1
 *                     startTime:
 *                       type: string
 *                       format: time
 *                       example: "09:00"
 *                     endTime:
 *                       type: string
 *                       format: time
 *                       example: "18:00"
 *                 required:
 *                   - id
 *                   - dayOfWeek
 *                   - startTime
 *                   - endTime
 *     responses:
 *       200:
 *         description: Тэг успешно обновлен
 */
router.put("/clinics/timetable", isAuthenticated, hasRole("clinic"), TimetableController.updateTimetable);

module.exports = router;