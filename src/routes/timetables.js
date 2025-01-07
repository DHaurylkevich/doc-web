const express = require("express");
const router = express.Router();
const TimetableController = require("../controllers/timetableController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const { validateParam } = require("../utils/validation");
const { validateRequest } = require("../middleware/errorHandler");

/**
 * @swagger
 * /clinics/{clinicId}/timetable:
 *   put:
 *     summary: Обновить расписание
 *     description: Обновляет существующие рассписания по clinicId.
 *     tags:
 *       - Timetable
 *     parameters:
 *       - name: clinicId
 *         in: path
 *         required: true
 *         description: ID клиники
 *         schema:
 *           type: integer
 *           example: 1
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
router.put("/clinics/:clinicId/timetable", isAuthenticated, hasRole("clinic"), validateParam("clinicId"), validateRequest, TimetableController.updateTimetable);

module.exports = router;