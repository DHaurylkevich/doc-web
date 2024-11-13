const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const { passwordValidation } = require('../utils/validation/userValidation');
const { validateRequest } = require('../middleware/errorHandler');

/**
 * @swagger
 * /users/account:
 *   get:
 *     summary: Возвращает информацию о пользователе по ID 
 *     description: Возвращает данные пользователя, включая его роль, на основе идентификатора
 *     operationId: getUserAccount
 *     security:
 *      - CookieAuth: []
 *     tags:
 *       - Users
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Данные пользователя
 *       404:
 *         description: Пользователь не найден
*/
router.get("/users/account", UserController.getUserAccount);
/**
 * @swagger
 * /users/{userId}/password:
 *   put:
 *     summary: Обновить пароль пользователя
 *     security:
 *      - CookieAuth: []
 *     operationId: updateUserPassword
 *     tags:
 *       - Users
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
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
 *       404:
 *         description: Пользователь не найден
 */
router.put("/users/:userId/password", passwordValidation, validateRequest, UserController.updateUserPassword);
/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Удаляет пользователя по ID и связанные с ним элементы
 *     operationId: deleteUser
 *     security:
 *      - CookieAuth: []
 *     tags:
 *       - Users
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
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
 */
router.delete("/users/:userId", UserController.deleteUser);
/**
 * @swagger
 * paths:
 *  /users/forgot-password:
 *    post:
 *      summary: Отправляет ссылку для изменения пароля
 *      description: Получая майл существующего юзера отправялет запрос на изменение пароляля на почту
 *      operationId: requestPasswordReset
 *      tags:
 *        - Users
 *      requestBody:
 *        description: Мэйл пользователя
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  example: email@gmail.com
 *                  description: email
 *      responses:
 *        200:
 *          description: Успешно отправлен запрос
 *        404:
 *          description: Пользователь не найден
 */
router.post("/users/forgot-password", UserController.requestPasswordReset);
/**
 * @swagger
 * paths:
 *  /reset-password:
 *   post:
 *      summary: Обновление пароля
 *      description: Обновление пароля после перехода по ссылке
 *      operationId: resetPassword
 *      security:
 *        - CookieAuth: []
 *      tags:
 *        - Users
 *      requestBody:
 *        description: Новый пароль
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                newPassword:
 *                  type: string
 *                  example: 123456789
 *                  description: Пароль пользователя
 *      responses:
 *        200:
 *          description: Успешный вход и получение токена
 *          content:
 *            application/json:
 *              schema:
 *                type: string
 *                example: "<access_token>"
 *        404:
 *          description: Пользователь не найден
 */
router.post("/reset-password", passwordValidation, validateRequest, UserController.resetPassword);

module.exports = router;
