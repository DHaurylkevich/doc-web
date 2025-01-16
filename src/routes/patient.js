const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

//  *       - name: doctorId
//  *         in: query
//  *         required: false
//  *         schema:
//  *           type: integer
//  *         description: ID доктора может вписывать клиника, чтобы узнать пациентов соего врача

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
router.get("/patients", isAuthenticated, hasRole(["doctor", "clinic"]), patientController.getPatientsFilter);
/**
 * @swagger
 * /patients/{patientId}:
 *   get:
 *     summary: Получить информацию о пациенте по ID.
 *     description: Возвращает данные пациента по указанному ID. Можно использовать для профиля
 *     tags:
 *       - Patients
 *     parameters:
 *       - name: patientId
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
router.get("/patients/:patientId", isAuthenticated, hasRole(["doctor", "admin"]), patientController.getPatientById);
/**
 * @swagger
 * /admins/patients:
 *   get:
 *     summary: Получить всех пациентов для админа (НЕПОНЯТНО ЗАЧЕМ ТАКАЯ ИНФА АДМИНУ)
 *     description: Возвращает допустимые данные о пациентах для админа.
 *     tags:
 *       - Patients
 *     parameters:
 *       - name: gender
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [male, female, other]
 *           example: "male"
 *         description: Пол пациента
 *       - name: sort
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           example: "asc"
 *         description: Сортировка по имени
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
 *         description: Успешно возвращены полные данные пациента
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     first_name:
 *                       type: string
 *                       example: "Jarret"
 *                     last_name:
 *                       type: string
 *                       example: "Douglas"
 *                     gender:
 *                       type: string
 *                       example: "female"
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get("/admins/patients", isAuthenticated, hasRole("admin"), patientController.getAllPatientsForAdmin);

module.exports = router;