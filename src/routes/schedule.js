const express = require("express");
const router = express.Router();
const ScheduleController = require("../controllers/scheduleController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

/**
 * @swagger
 * /clinics/{clinicId}/schedules:
 *   post:
 *     summary: Создание нового расписания
 *     description: Создает новое расписание для указанного врача и клиники.
 *     tags:
 *       - Schedules
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         description: ID клиники.
 *         schema:
 *           type: integer
 *         example: 3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorsIds:
 *                 type: array
 *                 description: Массив ID докторов
 *                 items:
 *                   type: integer
 *                 example: [4]
 *               interval:
 *                 type: integer
 *                 example: 30
 *               dates:
 *                 type: array
 *                 description: Массив ID докторов
 *                 items:
 *                   type: string
 *                   format: date
 *                   example: "2024-11-10"
 *               start_time:
 *                 type: string
 *                 format: time
 *                 example: "09:00"
 *               end_time:
 *                 type: string
 *                 format: time
 *                 example: "12:00"
 *     responses:
 *       201:
 *         description: Расписание успешно создано.
 *       400:
 *         description: Ошибка создания расписания.
 */
router.post("/clinics/:clinicId/schedules", isAuthenticated, hasRole("clinic"), ScheduleController.createSchedule)
/**
 * @swagger
 * /schedules/{scheduleId}:
 *   get:
 *     summary: Получить расписание по ID
 *     description: Возвращает информацию о расписании по его ID.
 *     tags:
 *       - Schedules
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         description: ID расписания.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Успешное получение расписания.
 *       404:
 *         description: Расписание не найдено.
 */
router.get("/schedules/:scheduleId", ScheduleController.getScheduleById);
/**
 * @swagger
 * /schedules/{scheduleId}:
 *   put:
 *     summary: Обновить расписание
 *     description: Обновляет существующее расписание по его ID.
 *     tags:
 *       - Schedules
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         description: ID расписания для обновления.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-11-15"
 *               start_time:
 *                 type: string
 *                 format: time
 *                 example: "10:00"
 *               end_time:
 *                 type: string
 *                 format: time
 *                 example: "13:00"
 *     responses:
 *       200:
 *         description: Расписание успешно обновлено.
 *       404:
 *         description: Расписание не найдено.
 *       400:
 *         description: Ошибка обновления расписания.
 */
router.put("/schedules/:scheduleId", isAuthenticated, hasRole("clinic"), ScheduleController.updateSchedule);
/**
 * @swagger
 * /schedules/{scheduleId}:
 *   delete:
 *     summary: Удалить расписание
 *     description: Удаляет существующее расписание по его ID.
 *     tags:
 *       - Schedules
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         description: ID расписания для удаления.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Расписание успешно удалено.
 *       404:
 *         description: Расписание не найдено.
 *       400:
 *         description: Ошибка удаления расписания.
 */
router.delete("/schedules/:scheduleId", ScheduleController.deleteSchedule);
/**
 * @swagger
 * /doctors/{doctorId}/schedules:
 *   get:
 *     summary: Получить расписание по ID доктора
 *     description: Возвращает список расписаний для указанного доктора.
 *     tags:
 *       - Schedules
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         description: ID доктора.
 *         schema:
 *           type: integer
 *         example: 4
 *     responses:
 *       200:
 *         description: Успешное получение расписания для доктора.
 *       400:
 *         description: Ошибка при получении расписания.
 */
router.get("/doctors/schedules", ScheduleController.getScheduleByDoctor);
/**
 * @swagger
 * /clinics/{clinicId}/schedules:
 *   get:
 *     summary: Получить расписание по ID клиники
 *     description: Возвращает список расписаний для указанной клиники.
 *     tags: 
 *       - Schedules
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         description: ID клиники.
 *         schema:
 *           type: integer
 *         example: 3
 *     responses:
 *       200:
 *         description: Успешное получение расписания для клиники.
 *       400:
 *         description: Ошибка при получении расписания.
 */
router.get("/clinics/:clinicId/schedules", ScheduleController.getScheduleByClinic);

module.exports = router;