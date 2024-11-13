const express = require("express");
const router = express.Router();
// const { authenticateJWT } = require("../middleware/auth");
const clinicController = require("../controllers/clinicController");

/**
 * @swagger
 * paths:
 *   /clinics:
 *     post:
 *       summary: Создать клинику
 *       description: Создает новую клинику с привязкой к адресу.
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
 *                     registration_day:
 *                       type: string
 *                       format: date
 *                       example: "2023-01-01"
 *                     nr_license:
 *                       type: string
 *                       example: "NR-123456"
 *                     email:
 *                       type: string
 *                       example: "clinic@example.com"
 *                     phone:
 *                       type: string
 *                       example: "+123456789"
 *                     description:
 *                       type: string
 *                       example: "Descripcion clinic"
 *                     schedule:
 *                       type: string
 *                       example: "Пн-Пт: 8:00 - 17:00"
 *                   required:
 *                     - name
 *                     - nip
 *                     - registration_day
 *                     - nr_license
 *                     - email
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
 *                     - home
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
 *               clinicData:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Durka"
 *                   nip:
 *                     type: string
 *                     example: "1234567890"
 *                   registration_day:
 *                     type: string
 *                     format: date
 *                     example: "2023-01-01"
 *                   nr_license:
 *                     type: string
 *                     example: "NR-123456"
 *                   email:
 *                     type: string
 *                     example: "clinic@example.com"
 *                   phone:
 *                     type: string
 *                     example: "+123456789"
 *                   description:
 *                     type: string
 *                     example: "Descripcion clinic"
 *                   schedule:
 *                     type: string
 *                     example: "Пн-Пт: 8:00 - 17:00"
 *                 required:
 *                   - name
 *                   - nip
 *                   - registration_day
 *                   - nr_license
 *                   - email
 *               addressData:
 *                 type: object
 *                 properties:
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
 *                 required:
 *                   - name
 *                   - nip
 *                   - registration_day
 *                   - nr_license
 *                   - email
 *         400:
 *           description: Ошибка валидации данных
 */
router.post("/clinics", clinicController.createClinic);
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
 *     responses:
 *       200:
 *         description: Список клиник успешно получен
 */
router.get("/clinics", clinicController.getAllClinicByParams);
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
 *       404:
 *         description: Клиника не найдена
 */
router.get("/clinics/:clinicId", clinicController.getFullClinic);
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
 *               clinicData:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Durka"
 *                   nip:
 *                     type: string
 *                     example: "1234567890"
 *                   registration_day:
 *                     type: string
 *                     format: date
 *                     example: "2023-01-01"
 *                   nr_license:
 *                     type: string
 *                     example: "NR-123456"
 *                   email:
 *                     type: string
 *                     example: "clinic@example.com"
 *                   phone:
 *                     type: string
 *                     example: "+123456789"
 *                   description:
 *                     type: string
 *                     example: "Descripcion clinic"
 *                   schedule:
 *                     type: string
 *                     example: "Пн-Пт: 8:00 - 17:00"
 *               addressData:
 *                 type: object
 *                 properties:
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
router.put("/clinics/:clinicId", clinicController.updateClinicById);
/**
 * @swagger
 * /clinics/{clinicId}:
 *   delete:
 *     summary: Удалить клинику
 *     description: Удаляет клинику по заданному ID.
 *     tags:
 *       - Clinics
 *     parameters:
 *       - name: clinicId
 *         in: path
 *         required: true
 *         description: ID клиники для удаления
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Клиника успешно удалена
 */
router.delete("/clinics/:clinicId", clinicController.deleteClinic);

module.exports = router;