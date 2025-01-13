const express = require("express");
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/auth');
const ClinicController = require("../controllers/clinicController");

/**
 * @swagger
 * paths:
 *   /clinics:
 *     post:
 *       summary: Создать клинику (только для администратора)
 *       description: Создает новую клинику с привязкой к адресу. Линк приходит кривой потому что нужен правильный адрес страницы для сброса пароля
 *       tags:
 *         - Clinics
 *       requestBody:
 *         description: Данные для создания клиники и адреса.
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clinicData:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Durka"
 *                     nip:
 *                       type: string
 *                       example: "1234567890"
 *                     nr_license:
 *                       type: string
 *                       example: "NR-123456"
 *                     email:
 *                       type: string
 *                       example: "clinic@gmail.com"
 *                     phone:
 *                       type: string
 *                       example: "+123456789"
 *                     password:
 *                       type: string
 *                       example: "123456789"
 *                     description:
 *                       type: string
 *                       example: "Descripcion clinic"
 *                   required:
 *                     - name
 *                     - nip
 *                     - nr_license
 *                     - email
 *                     - password
 *                 addressData:
 *                   type: object
 *                   properties:
 *                     city:
 *                       type: string
 *                       example: "Novogrudok"
 *                     street:
 *                       type: string
 *                       example: "st Lenina"
 *                     province:
 *                       type: string
 *                       example: "Grodhno"
 *                     home:
 *                       type: string
 *                       example: "10"
 *                     flat:
 *                       type: string
 *                       example: "5"
 *                     post_index:
 *                       type: string
 *                       example: "123456"
 *                   required:
 *                     - city
 *                     - street
 *                     - province
 *                     - home
 *                     - flat
 *                     - post_index
 *       responses:
 *         201:
 *           description: Клиника успешно создана
 *           content:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: "Durka"
 *               role:
 *                 type: string
 *                 example: "clinic"
 *               nip:
 *                 type: string
 *                 example: "1234567890"
 *               nr_license:
 *                 type: string
 *                 example: "NR-123456"
 *               email:
 *                 type: string
 *                 example: "clinic@example.com"
 *               phone:
 *                 type: string
 *                 example: "+123456789"
 *               password:
 *                 type: string
 *                 example: "$2b$10$kPOajAH0s346FtVnHoD6W.U.7B236S2LOQJv.Xsd7/6e4pfqJE46O"
 *               description:
 *                 type: string
 *                 example: "Descripcion clinic"
 *               address:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   city:
 *                     type: string
 *                     example: "Novogrudok"
 *                   street:
 *                     type: string
 *                     example: "st Lenina"
 *                   province:
 *                     type: string
 *                     example: "Grodhno"
 *                   home:
 *                     type: string
 *                     example: "10"
 *                   flat:
 *                     type: string
 *                     example: "5"
 *                   post_index:
 *                     type: string
 *                     example: "123456"
 *                   clinic_id:
 *                     type: integer
 *                     example: 1
 *         400:
 *           description: Ошибка валидации данных
 */
router.post("/clinics", isAuthenticated, hasRole("admin"), ClinicController.createClinic);
/**
 * @swagger
 * /clinics:
 *   get:
 *     summary: Получить все клиники с параметрами фильтрации
 *     description: Возвращает список всех клиник с возможностью фильтрации по имени, провинции, специальности и городу.
 *     tags:
 *       - Clinics
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Название клиники для фильтрации
 *         required: false
 *         schema:
 *           type: string
 *           example: "Durka"
 *       - name: province
 *         in: query
 *         description: Провинция для фильтрации
 *         required: false
 *         schema:
 *           type: string
 *           example: "Grodhno"
 *       - name: specialty
 *         in: query
 *         description: Специальность клиники для фильтрации
 *         required: false
 *         schema:
 *           type: string
 *           example: "Peper dr"
 *       - name: city
 *         in: query
 *         description: Город для фильтрации
 *         required: false
 *         schema:
 *           type: string
 *           example: "Novogrudok"
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
 *         description: Список клиник успешно получен
 */
router.get("/clinics", ClinicController.getAllClinicByParams);
/**
 * @swagger
 * /admins/clinics:
 *   get:
 *     summary: Получить все киники для админа (НЕПОНЯТНО ЗАЧЕМ ТАКАЯ ИНФА АДМИНУ)
 *     description: Возвращает допустимые данные о клинике для админа.
 *     tags:
 *       - Clinics
 *     parameters:
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
 *         description: Список клиник успешно получен
 */
router.get("/admins/clinics", isAuthenticated, hasRole("admin"), ClinicController.getAllClinicsForAdmin);
/**
 * @swagger
 * /clinics/cities:
 *   get:
 *     summary: Получить список всех городов, где есть клиники
 *     description: Возвращает уникальный список городов, в которых есть клиники
 *     tags:
 *       - Clinics
 *     responses:
 *       200:
 *         description: Успешное получение списка городов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["Warsaw", "Poznań", "Gdansk"]
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get("/clinics/cities", ClinicController.getAllCities);
/**
 * @swagger
 * /clinics/{clinicId}:
 *   get:
 *     summary: Получить полную информацию о клинике
 *     description: Возвращает подробные данные о клинике, включая адрес и связанные сервисы.
 *     tags:
 *       - Clinics
 *     parameters:
 *       - name: clinicId
 *         in: path
 *         required: true
 *         description: ID клиники
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Полная информация о клинике успешно получена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 photo:
 *                   type: string
 *                   example: "url"
 *                 name:
 *                   type: string
 *                   example: "Durka"
 *                 role:
 *                   type: string
 *                   example: "clinic"
 *                 nip:
 *                   type: string
 *                   example: "1234567890"
 *                 nr_license:
 *                   type: string
 *                   example: "NR-123456"
 *                 email:
 *                   type: string
 *                   example: "clinic@example.com"
 *                 phone:
 *                   type: string
 *                   example: "+123456789"
 *                 description:
 *                   type: string
 *                   example: "Descripcion clinic"
 *                 address:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     city:
 *                       type: string
 *                       example: "Novogrudok"
 *                     street:
 *                       type: string
 *                       example: "st Lenina"
 *                     province:
 *                       type: string
 *                       example: "Grodhno"
 *                     home:
 *                       type: string
 *                       example: "10"
 *                     flat:
 *                       type: string
 *                       example: "5"
 *                     post_index:
 *                       type: string
 *                       example: "123456"
 *       404:
 *         description: Клиника не найдена
 */
router.get("/clinics/:clinicId", ClinicController.getFullClinic);
/**
 * @swagger
 * /clinics/{clinicId}:
 *   put:
 *     summary: Обновить клинику
 *     description: Обновляет существующую клинику по ее ID.
 *     tags:
 *       - Clinics
 *     parameters:
 *       - name: clinicId
 *         in: path
 *         required: true
 *         description: ID клиники
 *         schema:
 *           type: integer
 *           example: 3
 *     requestBody:
 *       description: Обновленные данные клиники
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               photo:
 *                 type: string
 *                 example: "url"
 *               name:
 *                 type: string
 *                 example: "Durka"
 *               role:
 *                 type: string
 *                 example: "clinic"
 *               nip:
 *                 type: string
 *                 example: "1234567890"
 *               nr_license:
 *                 type: string
 *                 example: "NR-123456"
 *               email:
 *                 type: string
 *                 example: "clinic@example.com"
 *               phone:
 *                     type: string
 *                     example: "+123456789"
 *               description:
 *                 type: string
 *                 example: "Descripcion clinic"
 *               address:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   city:
 *                     type: string
 *                     example: "Novogrudok"
 *                   street:
 *                     type: string
 *                     example: "st Lenina"
 *                   province:
 *                     type: string
 *                     example: "Grodhno"
 *                   home:
 *                     type: string
 *                     example: "10"
 *                   flat:
 *                     type: string
 *                     example: "5"
 *                   post_index:
 *                     type: string
 *                     example: "123456"
 *     responses:
 *       200:
 *         description: Клиника успешно обновлена
 */
router.put("/clinics/:clinicId", ClinicController.updateClinicById);

module.exports = router;
// /**
//  * @swagger
//  * /clinics/{clinicId}:
//  *   delete:
//  *     summary: Удалить клинику
//  *     description: Удаляет клинику по заданному ID.
//  *     tags:
//  *       - Clinics
//  *     parameters:
//  *       - name: clinicId
//  *         in: path
//  *         required: true
//  *         description: ID клиники для удаления
//  *         schema:
//  *           type: integer
//  *           example: 1
//  *     responses:
//  *       200:
//  *         description: Successful
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: "Successful delete"
//  */
// router.delete("/clinics/:clinicId", ClinicController.deleteClinic);

module.exports = router;