const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

/**
 * @swagger
 * paths:
 *  /users/login:
 *    post:
 *      summary: Получить токен доступа
 *      description: Возвращает токен доступа при корректных данных пользователя
 *      operationId: loginUser
 *      tags:
 *        - Users
 *      parameters:
 *       - name: loginParam
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: email, телефон или pesel
 *       - name: password
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: пароль
 *      requestBody:
 *        description: Данные пользователя для входа
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                loginParam:
 *                  type: string
 *                  example: email@gmail.com
 *                  description: Логин (email, телефон или pesel) пользователя
 *                password:
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
router.post("/login", userController.loginUser);
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Возвращает информацию о пользователе по ID 
 *     description: Возвращает данные пользователя, включая его роль, на основе идентификатора
 *     operationId: getUserAccount
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
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
router.get("/:id", userController.getUserAccount);
/**
 * @swagger
 * /users/password/{id}:
 *   put:
 *     summary: Обновить пароль пользователя
 *     operationId: updateUserPassword
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
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
router.put("/password/:id", userController.updateUserPassword);
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Удаляет пользователя по ID и связанные с ним элементы
 *     operationId: deleteUser
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
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
 *       404:
 *         description: Пользователь не найден
 */
router.delete("/:id", userController.deleteUser);

module.exports = router;
