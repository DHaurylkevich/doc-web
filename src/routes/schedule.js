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
 * /schedules:
 *   get:
 *     summary: Получить расписание для DOCTOR, либо рассписание всех докторов для CLINIC
 *     description: Возвращает список расписаний для указанного доктора.
 *     tags:
 *       - Schedules
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Лимит на количество результатов
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: page
 *         in: query
 *         required: false
 *         description: Номер страницы
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Успешное получение расписания для доктора.
 *       400:
 *         description: Ошибка при получении расписания.
 */
router.get("/schedules", isAuthenticated, hasRole(["clinic", "doctor"]), ScheduleController.getScheduleByRole);
/**
 * @swagger
 * paths:
 *   /schedules/available-slots:
 *      get:
 *       summary: Получить доступные слоты для записи
 *       description: Получает доступные слоты для записи с учетом фильтров.
 *       operationId: getAvailableSlotsWithFilter
 *       tags:
 *         - Schedules
 *       parameters:
 *         - name: city
 *           in: query
 *           required: false
 *           description: Город для фильтрации
 *           schema:
 *             type: string
 *             example: "Novogrudok"
 *         - name: specialty
 *           in: query
 *           required: false
 *           description: Специальность врача
 *           schema:
 *             type: string
 *             example: "Associate"
 *         - name: date
 *           in: query
 *           required: false
 *           description: Дата для фильтрации
 *           schema:
 *             type: string
 *             format: date
 *             example: "2024-11-05"
 *         - name: visitType
 *           in: query
 *           required: false
 *           description: Какой-то тупой фильтр, потому что у нас нигде не обозначается что график или клиника(А если есть то это тупо и не нужно)), только для этого визита
 *           schema:
 *             type: string
 *             example: "консультация"
 *         - name: limit
 *           in: query
 *           required: false
 *           description: Лимит на количество результатов
 *           schema:
 *             type: integer
 *             default: 10
 *         - name: page
 *           in: query
 *           required: false
 *           description: Номер страницы
 *           schema:
 *             type: integer
 *             default: 1
 *       responses:
 *         200:
 *           description: Массив доступных слотов
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   pages:
 *                      type: object
 *                      example: 32
 *                   slots:
 *                      type: object
 *                      properties:
 *                        doctor_id:
 *                          type: integer
 *                          example: 1
 *                        description:
 *                          type: string
 *                          example: "Ascisco caritas minima surgo patrocinor crustulum"
 *                        rating:
 *                          type: number
 *                          format: float
 *                          example: 4.5
 *                        specialty:
 *                          type: string
 *                          example: "Associate"
 *                        address:
 *                          type: object
 *                          properties:
 *                            city:
 *                              type: string
 *                              example: "Новогрудок"
 *                            street:
 *                              type: string
 *                              example: "Мицкевича"
 *                            home:
 *                              type: string
 *                              example: "1"
 *                            flat:
 *                              type: string
 *                              example: "1"
 *                            post_index:
 *                              type: string
 *                              example: "1"
 *                        date:
 *                          type: string
 *                          format: date
 *                          example: "2024-11-05"
 *                        service:
 *                          type: object
 *                          properties:
 *                            name:
 *                              type: string
 *                              example: "Table"
 *                            price:
 *                              type: number
 *                              example: "258.66"
 *                        slots:
 *                          type: array
 *                          items:
 *                            type: string
 *                            example: "10:00"
 *         400:
 *           description: Неверные данные запроса
 *         500:
 *           description: Внутренняя ошибка сервера
 */
router.get("/schedules/available-slots", ScheduleController.getAvailableSlotsWithFilter);
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
 *     summary: Обновить расписание CLINIC
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

module.exports = router;