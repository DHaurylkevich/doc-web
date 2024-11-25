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
 *                   enum: [true, false]
 *                   example: true
 *                   description: Первичный визит или нет
 *                 visitType:
 *                   type: string
 *                   enum: ["prywatna", "NFZ"]
 *                   example: "prywatna"
 *                   description: Тип визита
 *                 status:
 *                   type: string
 *                   enum: ["active", "canceled", "completed"]
 *                   example: "active"
 *                   description: Статус записи
 *                 description:
 *                   type: string
 *                   example: "Headache"
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
 * paths:
 *   /appointments:
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
 *             example: "Novogrudok"
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
 *                           example: "Новогрудок"
 *                         street:
 *                           type: string
 *                           example: "Мицкевича"
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
 * paths:
 *   /clinics/{clinicId}/appointments:
 *      get:
 *       summary: Получить записи для графика
 *       description: Получает записи с учетом фильтров.
 *       operationId: getAppointmentsWithFilter
 *       tags:
 *         - Appointment
 *       parameters:
 *         - name: clinicId
 *           in: path
 *           required: true
 *           description: ID клиники
 *           schema:
 *             type: integer
 *         - name: doctorId
 *           in: query
 *           required: false
 *           description: ID Доктора  для фильтрации
 *           schema:
 *             type: integer
 *             example: 1
 *         - name: patientId
 *           in: query
 *           required: false
 *           description: ID Пациента  для фильтрации
 *           schema:
 *             type: integer
 *             example: 1
 *         - name: date
 *           in: query
 *           required: false
 *           description: Дата для фильтрации
 *           schema:
 *             type: string
 *             format: date
 *             example: "2024-11-05"
 *         - name: specialty
 *           in: query
 *           required: false
 *           description: Специальность доктора
 *           schema:
 *             type: string
 *             example: "Raper"
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
 *           description: Массив записей с информацией о врачах, пациентах, специальностях, услугах, дате и времени приёма
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     doctor:
 *                       type: object
 *                       properties:
 *                         first_name:
 *                           type: string
 *                           example: "Adam"
 *                         last_name:
 *                           type: string
 *                           example: "Mickevich"
 *                     patient:
 *                       type: object
 *                       properties:
 *                         first_name:
 *                           type: string
 *                           nullable: true
 *                           example: "Nulle"
 *                         last_name:
 *                           type: string
 *                           nullable: true
 *                           example: "Nulovy"
 *                     specialty:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Dr Dre"
 *                     service:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Cut arm"
 *                         price:
 *                           type: string
 *                           example: "10.20"
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2024-11-10"
 *                     start_time:
 *                       type: string
 *                       format: time
 *                       example: "10:30"
 *                     end_time:
 *                       type: string
 *                       format: time
 *                       example: "11:00"
 *         400:
 *           description: Неверные данные запроса
 *         500:
 *           description: Внутренняя ошибка сервера
 */
router.get("/clinics/:clinicId/appointments", AppointmentController.getAppointmentsWithFilter);
/**
 * @swagger
 *   /doctors/{doctorId}/appointments:
 *     get:
 *       summary: Получить все записи на прием
 *       description: Получает все записи для указанного врача.
 *       operationId: getAppointmentsByDoctor
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
 *         - name: startDate
 *           in: query
 *           required: false
 *           description: Начальная дата
 *           schema:
 *             type: string
 *             format: date
 *             example: "2024-11-05"
 *         - name: endDate
 *           in: query
 *           required: false
 *           description: Конечная дата
 *           schema:
 *             type: string
 *             format: date
 *             example: "2024-11-10"
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
router.get("/doctors/:doctorId/appointments", AppointmentController.getAppointmentsByDoctor);
/**
 * @swagger
 *   /patients/{patientId}/appointments:
 *     get:
 *       summary: Получить все записи пациента
 *       description: Получает все записи на прием для указанного пациента.
 *       operationId: getAppointmentsByPatient
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
router.get("/patients/:patientId/appointments", AppointmentController.getAppointmentsByPatient);
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