const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/auth");
const { passwordValidation } = require('../utils/validation/userValidation');
const { validateRequest } = require('../middleware/errorHandler');
const upload = require("../middleware/upload").uploadImages;

/**
 * @swagger
 * /users/account:
 *   get:
 *     summary: Возвращает информацию о пользователе для всех субъектов
 *     description: Возвращает данные пользователя, включая его роль, для всех субъектов patient, doctor, clinic, admin
 *     security:
 *      - CookieAuth: []
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Информация о пользователе(patient, doctor, clinic, admin)
*/
router.get("/users/account", isAuthenticated, UserController.getUserAccount);
/**
 * @swagger
 * /users:
 *   put:
 *     summary: Обновить информацию
 *     description: Обновляет данные пользователя. Работает для всех субъектов связаныйх с user. doctorData нужен только для доктора
 *     tags: [Users]
 *     requestBody:
 *       description: Данные для обновления
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
 *                   first_name:
 *                     type: string
 *                     example: "Ann"
 *                   last_name:
 *                     type: string
 *                     example: "Kingin"
 *                   email:
 *                     type: string
 *                     example: "new_email@gmail.com"
 *                   gender:
 *                     type: string
 *                     enum: ["male", "female"]
 *                     example: "male"
 *                   pesel:
 *                     type: string
 *                     example: "12345678901"
 *                   phone:
 *                     type: string
 *                     example: "+1234567890"
 *               addressData:
 *                 type: object
 *                 description: Адрес
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
router.put("/users", isAuthenticated, UserController.updateUser);
/**
 * @swagger
 * /users/password:
 *   put:
 *     summary: Обновить пароль пользователя
 *     security:
 *      - CookieAuth: []
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Пароль успешно изменен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 */
router.put("/users/password", isAuthenticated, passwordValidation, validateRequest, UserController.updateUserPassword);
/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Удаляет пользователя(doctor,patient,clinic) по ID и связанные с ним элементы
 *     operationId: deleteUser
 *     security:
 *      - CookieAuth: []
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Успешное удаление пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successful delete"
 *       401:
 *         description: Unauthorized user
 */
router.delete("/users", isAuthenticated, UserController.deleteUser);
/**
 * @swagger
 * /users/photo:
 *   post:
 *     summary: Обновляет аватарку пользователя
 *     description: Загружает новую фотографию профиля для аутентифицированного пользователя
 *     tags:
 *       - Users
 *     security:
 *       - CookieAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Файл изображения для загрузки
 *     responses:
 *       200:
 *         description: Фотография профиля успешно обновлена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile photo updated successfully"
 *       400:
 *         description: Ошибка валидации или отсутствие файла
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No file uploaded or invalid file format"
 *       401:
 *         description: Пользователь не аутентифицирован
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/users/photo", isAuthenticated, upload.single("image"), UserController.updateImage);

module.exports = router;