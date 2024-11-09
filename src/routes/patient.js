const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Регистрация пациента/Пользователя
 *     description: Регистрация нового пациента, только его пароль и email/phone/pesel и возврат токена доступа при успешной регистрации.
 *     tags:
 *       - Patients
 *     requestBody:
 *       description: Данные для регистрации пациента
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userData:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: email@gmail.com
 *                   phone:
 *                     type: string
 *                     example: "+123456789"
 *                   gender:
 *                     type: string
 *                     example: "male"
 *               patientData:
 *                 type: object
 *                 properties:
 *                   market_inf:
 *                     type: boolean
 *                     example: false
 *     responses:
 *       201:
 *         description: Пациент успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "<access_token>"
 *       400:
 *         description: Неверные данные для регистрации
 */
router.post("/patients", patientController.registrationPatient);
/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Получить пациентов по записям c фильтрацией 
 *     description: Возвращает список пациентов по записям в клинниках/докторах по указанным фильтрам. Эндпоинт для клиники/доктора, чтобы знать своих пациентов
 *     tags:
 *       - Patients
 *     parameters:
 *       - name: sort
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: "asc"
 *         description: Сортировка по дате создания
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Максимальное количество записей
 *       - name: offset
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           example: 0
 *         description: Сдвиг для пагинации
 *       - name: doctorId
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID доктора
 *       - name: clinicId
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID клиники
 *     responses:
 *       200:
 *         description: Успешное получение списка пациентов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   gender:
 *                     type: string
 *                   user:
 *                     type: object
 *                     properties:
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 */
router.get("/patients", patientController.getPatientsFilter);
/**
 * @swagger
 * /patients/{userId}:
 *   get:
 *     summary: Получить информацию о пациенте по ID.
 *     description: Возвращает данные пациента по указанному ID. Можно использовать для профиля
 *     tags:
 *       - Patients
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пациента
 *     responses:
 *       200:
 *         description: Информация о пациенте успешно получена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 gender:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *       404:
 *         description: Пациент не найден
 */
router.get("/patients/:userId", patientController.getPatientById);
/**
 * @swagger
 * /patients/{userId}:
 *   put:
 *     summary: Обновить информацию о пациенте
 *     description: Обновляет данные пациента по указанному ID пользователя.
 *     tags:
 *       - Patients
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя пациента
 *     requestBody:
 *       description: Данные для обновления пациента
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userData:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: "new_email@gmail.com"
 *                   phone:
 *                     type: string
 *                     example: "+1234567890"
 *                   gender:
 *                     type: string
 *                     example: "female"
 *               patientData:
 *                 type: object
 *                 properties:
 *                   market_inf:
 *                     type: boolean
 *                     example: true
 *               addressData:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                     example: "Los Angeles"
 *     responses:
 *       200:
 *         description: Данные пациента успешно обновлены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: Обновленные данные пользователя
 *                 patient:
 *                   type: object
 *                   description: Обновленные данные пациента
 *                 address:
 *                   type: object
 *                   description: Обновленные данные адреса
 */
router.put("/patients/:userId", patientController.updatePatientById);

module.exports = router;
