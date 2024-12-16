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
 *     description: Возвращает данные пользователя, включая его роль, на основе идентификатора
 *     operationId: getUserAccount
 *     security:
 *      - CookieAuth: []
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Информация о пользователе НЕ ТОЧНАЯ, там просто еще клиника 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 16
 *                 photo:
 *                   type: string
 *                   example: null
 *                 first_name:
 *                   type: string
 *                   example: 'Buddy'
 *                 last_name:
 *                   type: string
 *                   example: 'Graham'
 *                 email:
 *                   type: string
 *                   example: 'Winnifred96@hotmail.com'
 *                 gender:
 *                   type: string
 *                   example: null
 *                 pesel:
 *                   type: string
 *                   example: '12345678901'
 *                 phone:
 *                   type: string
 *                   example: '+17326402141'
 *                 password:
 *                   type: string
 *                   example: '$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda'
 *                 role:
 *                   type: string
 *                   example: 'patient'
 *                 birthday:
 *                   type: string
 *                   format: date-time
 *                   example: '2024-11-21T03:54:11.313Z'
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
 *       401:
 *         description: Unauthorized user
 *       404:
 *         description: Пользователь не найден
*/
router.get("/users/account", isAuthenticated, UserController.getUserAccount);
/**
 * @swagger
 * /users:
 *   put:
 *     summary: Обновить информацию о докторе, пациенте, клинике, админе
 *     description: Обновляет данные пользователя.
 *     tags:
 *       - Users
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
 *                   description:
 *                     type: string
 *                     example: "Corroboro avaritia pecto suadeo. Claudeo aestas comitatus. Benigne spargo appono denuncio terra."
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
 *     operationId: updateUserPassword
 *     tags:
 *       - Users
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
 *       401:
 *         description: Unauthorized user
 *       400:
 *         description: Password Error, Old password is required, New password is required, Password must be at least 8 characters
 *       404:
 *         description: User not found
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
 *     tags:
 *       - Users
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