const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");

/**
 * @swagger
 * paths:
 *   /clinic/{clinicId}/doctors:
 *     post:
 *       summary: Создание нового доктора
 *       operationId: createDoctor
 *       tags:
 *         - Doctors
 *       parameters:
 *         - name: clinicId
 *           in: path
 *           required: true
 *           description: ID клиники для поиска
 *           schema:
 *             type: integer
 *             example: 1
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userData:
 *                   type: object
 *                   description: Данные пользователя
 *                   properties:
 *                     first_name:
 *                       type: string
 *                       description: Имя пользователя
 *                       example: "Серега"
 *                     last_name:
 *                       type: string
 *                       description: Фамилия пользователя
 *                       example: "Фамильный"
 *                     email:
 *                       type: string
 *                       description: Электронная почта пользователя
 *                       example: "mail@example.com"
 *                     gender:
 *                       type: string
 *                       description: Пол пользователя
 *                       enum: ["male", "female", "other"]
 *                       example: "male"
 *                     pesel:
 *                       type: string
 *                       description: PESEL пользователя
 *                       example: "12345678901"
 *                     phone:
 *                       type: string
 *                       description: Телефон пользователя
 *                       example: "+48123123123"
 *                     password:
 *                       type: string
 *                       description: Пароль пользователя
 *                       example: "securepassword123"
 *                     birthday:
 *                       type: string
 *                       format: date
 *                       description: Дата рождения пользователя
 *                       example: "1980-01-01"
 *                 addressData:
 *                   type: object
 *                   description: Адрес доктора
 *                   properties:
 *                     city:
 *                       type: string
 *                       example: "Effertzhaven"
 *                     province:
 *                       type: string
 *                       example: "Ohio"
 *                     street:
 *                       type: string
 *                       example: "N Chestnut Street"
 *                     home:
 *                       type: string
 *                       example: "7903"
 *                     flat:
 *                       type: string
 *                       example: "495"
 *                     post_index:
 *                       type: string
 *                       example: "37428-7078"
 *                 doctorData:
 *                   type: object
 *                   description: Данные доктора
 *                   properties:
 *                     hired_at:
 *                       type: string
 *                       format: date
 *                       description: Дата найма доктора
 *                       example: "2023-01-01"
 *                     description:
 *                       type: string
 *                       description: Описание доктора
 *                       example: "Dr dre eeeee"
 *                 specialtyId:
 *                   type: integer
 *                   description: Идентификатор специальности
 *                   example: 5
 *                 servicesIds:
 *                   type: array
 *                   description: Массив идентификаторов услуг
 *                   items:
 *                     type: integer
 *                   example: [1, 2, 3]
 *       responses:
 *         200:
 *           description: Успешный вход и получение токена
 *         404:
 *           description: Пользователь не найден
 */
router.post("/clinic/:clinicId/doctors/", doctorController.createDoctor);
/**
 * @swagger
 * /doctors/{doctorId}/short:
 *   get:
 *     summary: Получить краткую информацию о враче
 *     description: Возвращает краткие данные о враче, такие как имя, фамилия и специальность, по указанному ID врача.
 *     tags:
 *       - Doctors
 *     parameters:
 *       - name: doctorId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Уникальный идентификатор врача
 *     responses:
 *       200:
 *         description: Успешно возвращены краткие данные врача
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: Уникальный идентификатор врача
 *                   example: 1
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     first_name:
 *                       type: string
 *                       example: "Адам"
 *                     last_name:
 *                       type: string
 *                       example: "Мицкевич"
 *                 specialty:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     name:
 *                       type: string
 *                       example: "Кардиология"
 *       404:
 *         description: Врач не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get("/doctors/:doctorId/short", doctorController.getShortDoctorById);
/**
 * @swagger
 * /doctors/{userId}:
 *   get:
 *     summary: Получить полную информацию о враче
 *     description: Возвращает полные данные о враче по указанному ID пользователя, включая адрес и специальность.
 *     tags:
 *       - Doctors
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Уникальный идентификатор пользователя
 *     responses:
 *       200:
 *         description: Успешно возвращены полные данные врача
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: Уникальный идентификатор врача
 *                   example: 1
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     first_name:
 *                       type: string
 *                       example: "Адам"
 *                     last_name:
 *                       type: string
 *                       example: "Яблочный"
 *                     email:
 *                       type: string
 *                       example: "doctor@example.com"
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *                     address:
 *                       type: object
 *                       properties:
 *                         city:
 *                           type: string
 *                           example: "Новогрудок"
 *                         province:
 *                           type: string
 *                           example: "Гродненская область"
 *                         street:
 *                           type: string
 *                           example: "ул. Мицкевича"
 *                         home:
 *                           type: string
 *                           example: "69"
 *                         flat:
 *                           type: string
 *                           example: "96"
 *                         post_index:
 *                           type: string
 *                           example: "123456"
 *                 specialty:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     name:
 *                       type: string
 *                       example: "Кардиология"
 *       404:
 *         description: Врач не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get("/doctors/:userId", doctorController.getDoctorById);
/**
 * @swagger
 * /users/{userId}/doctors:
 *   put:
 *     summary: Обновить информацию о докторе
 *     description: Обновляет данные доктора по указанному ID пользователя.
 *     tags:
 *       - Doctors
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя доктора
 *     requestBody:
 *       description: Данные для обновления доктора
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userData:
 *                 type: object
 *                 description: Данные пользователя
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: "new_email@gmail.com"
 *                   phone:
 *                     type: string
 *                     example: "+1234567890"
 *               addressData:
 *                 type: object
 *                 description: Адрес доктора
 *                 properties:
 *                   city:
 *                     type: string
 *                     example: "Effertzhaven"
 *                   province:
 *                     type: string
 *                     example: "Ohio"
 *                   street:
 *                     type: string
 *                     example: "N Chestnut Street"
 *                   home:
 *                     type: integer
 *                     example: "7903"
 *                   flat:
 *                     type: integer
 *                     example: "495"
 *                   post_index:
 *                     type: string
 *                     example: "37428-7078"
 *               doctorData:
 *                 type: object
 *                 description: Данные доктора
 *                 properties:
 *                   hired_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-11-13T07:29:36.618Z"
 *                   vacation days:
 *                      type: integer
 *                      example: 27
 *                   description:
 *                     type: string
 *                     example: "Corroboro avaritia pecto suadeo. Claudeo aestas comitatus. Benigne spargo appono denuncio terra."
 *                   user_id:
 *                     type: integer
 *                     example: 1
 *                   specialty_id:
 *                     type: integer
 *                     example: 2
 *               servicesIds:
 *                 type: array
 *                 description: Массив ID услуг доктора
 *                 items:
 *                   type: integer
 *                 example: [2]
 *     responses:
 *       200:
 *         description: Данные доктора успешно обновлены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Данные доктора успешно обновлены"
 */
router.put("/users/:userId/doctors", doctorController.updateDoctorById);
/**
 * @swagger
 * /clinics/{clinicId}/doctors:
 *   get:
 *     summary: Получить всех докторов с фильтрацией
 *     description: Возвращает докторов связанные с одной клинникой, можно использовать фильтры.
 *     tags:
 *       - Doctors
 *     parameters:
 *       - name: clinicId
 *         in: path
 *         required: true
 *         description: ID клиники для поиска
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: gender
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [male, female, other]
 *           example: "male"
 *         description: Пол доктора
 *       - name: sort
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: "asc"
 *         description: Сортировка по дате создания
 *     responses:
 *       200:
 *         description: Массив всех докторов
 */
router.get("/clinics/:clinicId/doctors", doctorController.getDoctorsByClinicWithSorting);

module.exports = router;