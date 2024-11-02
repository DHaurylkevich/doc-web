const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: Создание нового расписания
 *     description: Создает новое расписание для указанного врача и клиники.
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctor_id:
 *                 type: integer
 *                 example: 1
 *               clinic_id:
 *                 type: integer
 *                 example: 2
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-11-10"
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
router.post("/schedules", scheduleController.createSchedule);

/**
 * @swagger
 * /schedules/{id}:
 *   get:
 *     summary: Получить расписание по ID
 *     description: Возвращает информацию о расписании по его ID.
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
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
router.get("/schedules/:id", scheduleController.getScheduleById);

/**
 * @swagger
 * /schedules/{id}:
 *   put:
 *     summary: Обновить расписание
 *     description: Обновляет существующее расписание по его ID.
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
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
router.put("/schedules/:id", scheduleController.updateSchedule);

/**
 * @swagger
 * /schedules/{id}:
 *   delete:
 *     summary: Удалить расписание
 *     description: Удаляет существующее расписание по его ID.
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
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
router.delete("/schedules/:id", scheduleController.deleteSchedule);

/**
 * @swagger
 * /schedules/doctor/{doctor_id}:
 *   get:
 *     summary: Получить расписание по ID доктора
 *     description: Возвращает список расписаний для указанного доктора.
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: doctor_id
 *         required: true
 *         description: ID доктора.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Успешное получение расписания для доктора.
 *       400:
 *         description: Ошибка при получении расписания.
 */
router.get("/doctors/:doctorId/schedules", scheduleController.getScheduleByDoctor);

/**
 * @swagger
 * /schedules/clinic/{clinic_id}:
 *   get:
 *     summary: Получить расписание по ID клиники
 *     description: Возвращает список расписаний для указанной клиники.
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: clinic_id
 *         required: true
 *         description: ID клиники.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Успешное получение расписания для клиники.
 *       400:
 *         description: Ошибка при получении расписания.
 */
router.get("/clinics/:clinicId/schedules", scheduleController.getScheduleByClinic);

module.exports = router;
