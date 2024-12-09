const express = require("express");
const router = express.Router();
const AppointmentController = require("../controllers/appointmentController");
const { isAuthenticated } = require("../middleware/auth");

/**
 * @swagger
 * paths:
 *   /appointments:
 *     post:
 *       summary: Создает запись к врачу юзером
 *       description: Создает новую запись к врачу с заданными параметрами по id пациента из куки.
 *       operationId: createAppointment
 *       tags:
 *         - Appointment
 *       security:
 *         - CookieAuth: []
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
router.post("/appointments", isAuthenticated, AppointmentController.createAppointment);
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
router.get("/appointments", AppointmentController.getAvailableSlotsWithFilter);
/**
 * @swagger
 *    /appointments/{id}:
 *     delete:
 *       summary: Удаляет запись
 *       description: Удаляет запись по указанному ID.
 *       operationId: deleteAppointment
 *       tags:
 *         - Appointment
 *       security:
 *         - CookieAuth: []
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
router.delete("/appointments/:id", isAuthenticated, AppointmentController.deleteAppointment);
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
 *           description: Массив записей с информацией о врачах, пациентах, специальностях, услугах, дате и времени приёма
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                     pages:
 *                        type: object
 *                        example: 32
 *                     slots:
 *                        type: object
 *                        properties:
 *                           doctor:
 *                             type: object
 *                             properties:
 *                               first_name:
 *                                 type: string
 *                                 example: "Adam"
 *                               last_name:
 *                                 type: string
 *                                 example: "Mickevich"
 *                           patient:
 *                             type: object
 *                             properties:
 *                               first_name:
 *                                 type: string
 *                                 nullable: true
 *                                 example: "Nulle"
 *                               last_name:
 *                                 type: string
 *                                 nullable: true
 *                                 example: "Nulovy"
 *                               photo:
 *                                 type: string
 *                                 example: "https://example.com"
 *                           specialty:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "Dr Dre"
 *                           service:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "Cut arm"
 *                               price:
 *                                 type: string
 *                                 example: "10.20"
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: "2024-11-10"
 *                           start_time:
 *                             type: string
 *                             format: time
 *                             example: "10:30"
 *                           end_time:
 *                             type: string
 *                             format: time
 *                             example: "11:00"
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
 *         - name: status
 *           in: query
 *           required: false
 *           description: Статус
 *           schema:
 *             type: string
 *             enum: ['active', 'canceled', 'completed']
 *             example: "active"
 *       responses:
 *         200:
 *           description: Массив записей врача
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                     pages:
 *                        type: object
 *                        example: 32
 *                     slots:
 *                        type: object
 *                        properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: "2025-02-11"
 *                           start_time:
 *                             type: string
 *                             example: "06:02"
 *                           end_time:
 *                             type: string
 *                             example: "06:58"
 *                           description:
 *                             type: string
 *                             example: "Arbor cuius atqui viridis aduro censura."
 *                           service:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "Gorgeous Wooden Table"
 *                               price:
 *                                 type: number
 *                                 example: "10.66"
 *                           first_visit:
 *                             type: boolean
 *                             example: true
 *                           visit_type:
 *                             type: string
 *                             example: "NFZ"
 *                           status:
 *                             type: string
 *                             example: "completed"
 *                           patient:
 *                             type: object
 *                             properties:
 *                               patientId:
 *                                 type: number
 *                                 example: "1"
 *                               first_name:
 *                                 type: string
 *                                 example: "Mariano"
 *                               last_name:
 *                                 type: string
 *                                 example: "Schulist"
 *                               photo:
 *                                 type: string
 *                                 example: "https://avatars.githubusercontent.com/u/6199909"
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
 *           description: Массив записей пациента
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                     pages:
 *                        type: object
 *                        example: 32
 *                     slots:
 *                        type: object
 *                        properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: "2025-09-25"
 *                           start_time:
 *                             type: string
 *                             example: "20:53"
 *                           end_time:
 *                             type: string
 *                             example: "21:52"
 *                           description:
 *                             type: string
 *                             example: "Adipiscor comminor arx cibo arto combibo verto deputo atque demo."
 *                           service:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "Gorgeous Wooden Table"
 *                               price:
 *                                 type: number
 *                                 example: "10.66"
 *                           first_visit:
 *                             type: boolean
 *                             example: false
 *                           visit_type:
 *                             type: string
 *                             example: "prywatna"
 *                           status:
 *                             type: string
 *                             example: "active"
 *                           doctor:
 *                             type: object
 *                             properties:
 *                               first_name:
 *                                 type: string
 *                                 example: "Helmer"
 *                               last_name:
 *                                 type: string
 *                                 example: "MacGyver"
 *                               photo:
 *                                 type: string
 *                                 example: "https://avatars.githubusercontent.com/u/80491811"
 *         404:
 *           description: Записи не найдены
 *         500:
 *           description: Внутренняя ошибка сервера
 */
router.get("/patients/:patientId/appointments", AppointmentController.getAppointmentsByPatient);

module.exports = router;