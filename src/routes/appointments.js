const express = require("express");
const router = express.Router();
const AppointmentController = require("../controllers/appointmentController");
/**
 * @swagger
 * paths:
 *   /appointments:
 *     post:
 *       summary: Создает запись к врачу
 *       description: Создает новую запись к врачу с заданными параметрами.
 *       operationId: createAppointment
 *       tags:
 *         - Appointment
 *       requestBody:
 *         description: Данные для создания записи
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 doctorId:
 *                   type: integer
 *                   example: 1
 *                   description: ID врача, к которому создается запись
 *                 doctorServiceId:
 *                   type: integer
 *                   example: 1
 *                   description: ID услуги врача
 *                 clinicId:
 *                   type: integer
 *                   example: 1
 *                   description: ID клиники
 *                 userId:
 *                   type: integer
 *                   example: 1
 *                   description: ID пользователя (пациента)
 *                 date:
 *                   type: string
 *                   format: date
 *                   example: "2024-11-05"
 *                   description: Дата записи
 *                 timeSlot:
 *                   type: string
 *                   example: "10:00"
 *                   description: Временной интервал записи
 *                 firstVisit:
 *                   type: boolean
 *                   example: true
 *                   description: Первичный визит или нет
 *                 visitType:
 *                   type: string
 *                   example: "консультация"
 *                   description: Тип визита
 *                 status:
 *                   type: string
 *                   example: "подтверждено"
 *                   description: Статус записи
 *                 description:
 *                   type: string
 *                   example: "Пациент жалуется на боли в спине"
 *                   description: Описание визита
 *       responses:
 *         201:
 *           description: Успешно создана запись
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   doctorId:
 *                     type: integer
 *                     example: 1
 *                   clinicId:
 *                     type: integer
 *                     example: 1
 *                   date:
 *                     type: string
 *                     format: date
 *                     example: "2024-11-05"
 *                   timeSlot:
 *                     type: string
 *                     example: "10:00"
 *         400:
 *           description: Неверные данные запроса
 *         404:
 *           description: Врач или клиника не найдены
 *         500:
 *           description: Внутренняя ошибка сервера
 */
router.post("/appointments", AppointmentController.createAppointment);
/**
 * @swagger
 *      get:
 *       summary: Получить доступные слоты для записи
 *       description: Получает доступные слоты для записи с учетом фильтров.
 *       operationId: getAvailableSlotsWithFilter
 *       tags:
 *         - Appointment
 *       parameters:
 *         - name: city
 *           in: query
 *           required: false
 *           description: Город для фильтрации
 *           schema:
 *             type: string
 *             example: "Москва"
 *         - name: specialty
 *           in: query
 *           required: false
 *           description: Специальность врача
 *           schema:
 *             type: string
 *             example: "хирург"
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
 *           description: Тип визита
 *           schema:
 *             type: string
 *             example: "консультация"
 *         - name: limit
 *           in: query
 *           required: false
 *           description: Лимит на количество результатов
 *           schema:
 *             type: integer
 *             example: 10
 *         - name: offset
 *           in: query
 *           required: false
 *           description: Смещение для пагинации
 *           schema:
 *             type: integer
 *             example: 0
 *       responses:
 *         200:
 *           description: Массив доступных слотов
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     doctor_id:
 *                       type: integer
 *                       example: 1
 *                     description:
 *                       type: string
 *                       example: "Хирург"
 *                     rating:
 *                       type: number
 *                       format: float
 *                       example: 4.5
 *                     specialty:
 *                       type: string
 *                       example: "хирург"
 *                     address:
 *                       type: object
 *                       properties:
 *                         city:
 *                           type: string
 *                           example: "Москва"
 *                         street:
 *                           type: string
 *                           example: "Ленина"
 *                         home:
 *                           type: string
 *                           example: "1"
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2024-11-05"
 *                     slots:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "10:00"
 *         400:
 *           description: Неверные данные запроса
 *         500:
 *           description: Внутренняя ошибка сервера
 */
router.get("/appointments", AppointmentController.getAvailableSlotsWithFilter);
/**
 * @swagger
 *   /doctors/{doctorId}/appointments:
 *     get:
 *       summary: Получить все записи к врачу
 *       description: Получает все записи для указанного врача.
 *       operationId: getAllAppointmentsByDoctor
 *       tags:
 *         - Appointment
 *       parameters:
 *         - name: doctorId
 *           in: path
 *           required: true
 *           description: ID врача
 *           schema:
 *             type: integer
 *             example: 1
 *       responses:
 *         200:
 *           description: Массив записей врача
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2024-11-05"
 *                     timeSlot:
 *                       type: string
 *                       example: "10:00"
 *                     status:
 *                       type: string
 *                       example: "подтверждено"
 *         404:
 *           description: Записи не найдены
 *         500:
 *           description: Внутренняя ошибка сервера
 */
router.get("/doctors/:doctorId/appointments", AppointmentController.getAllAppointmentsByDoctor);
/**
 * @swagger
 *   /patients/{patientId}/appointments:
 *     get:
 *       summary: Получить все записи пациента
 *       description: Получает все записи для указанного пациента.
 *       operationId: getAllAppointmentsByPatient
 *       tags:
 *         - Appointment
 *       parameters:
 *         - name: patientId
 *           in: path
 *           required: true
 *           description: ID пациента
 *           schema:
 *             type: integer
 *             example: 1
 *       responses:
 *         200:
 *           description: Массив записей пациента
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     doctorId:
 *                       type: integer
 *                       example: 1
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2024-11-05"
 *                     timeSlot:
 *                       type: string
 *                       example: "10:00"
 *                     status:
 *                       type: string
 *                       example: "подтверждено"
 *         404:
 *           description: Записи не найдены
 *         500:
 *           description: Внутренняя ошибка сервера
 */
router.get("/patients/:patientId/appointments", AppointmentController.getAllAppointmentsByPatient);
/**
 * @swagger
 *    /appointments/{id}:
 *     delete:
 *       summary: Удаляет запись
 *       description: Удаляет запись по указанному ID.
 *       operationId: deleteAppointment
 *       tags:
 *         - Appointment
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID записи
 *           schema:
 *             type: integer
 *             example: 1
 *       responses:
 *         200:
 *           description: Запись успешно удалена
 *         404:
 *           description: Запись не найдена
 *         500:
 *           description: Внутренняя ошибка сервера
 */
router.delete("/appointments/:id", AppointmentController.deleteAppointment);

module.exports = router;