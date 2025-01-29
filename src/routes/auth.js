const express = require("express");
const router = express.Router();
const passport = require("passport");
const AppError = require("../utils/appError");
const AuthController = require("../controllers/authController");

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Аутентификация пользователя
 *     tags: 
 *       - Auth
 *     servers:
 *       - url: http://localhost:3000
 *       - url: https://doc-web-rose.vercel.app
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               loginParam:
 *                 type: string
 *                 description: Email, телефон или PESEL пользователя
 *                 example: "doctor@gmail.com"
 *               password:
 *                 type: string
 *                 description: Пароль пользователя
 *                 example: "123456789"
 *     responses:
 *       '200':
 *         description: Успешная аутентификация
 *       '401':
 *         description: Неверные учетные данные
 */
router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new AppError(info.message || "Неверные учетные данные", 404));
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return AuthController.login(req, res, next, info);
        });
    })(req, res, next);
});
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     servers:
 *       - url: http://localhost:3000
 *       - url: https://doc-web-rose.vercel.app
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                  type: string
 *                  example: "test@gmail.com"
 *               password:
 *                  type: string
 *                  example: "123456789"
 *     responses:
 *       200:
 *         description: Пользователь успешно зарегистрирован
 *       400:
 *         description: Ошибка валидации данных
 */
router.post("/register", AuthController.register);
/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Выход пользователя из системы
 *     tags: [Auth]
 *     servers:
 *       - url: http://localhost:3000
 *       - url: https://doc-web-rose.vercel.app
 *     responses:
 *       200:
 *         description: Успешный выход из системы
 *       500:
 *         description: Ошибка сервера
 */
router.get("/logout", AuthController.logout);
/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Начало аутентификации через Google
 *     tags: [Auth]
 *     servers:
 *       - url: http://localhost:3000
 *       - url: https://doc-web-rose.vercel.app
 *     responses:
 *       302:
 *         description: Перенаправление на страницу аутентификации Google
 */
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Callback URL для аутентификации через Google
 *     tags: [Auth]
 *     servers:
 *       - url: http://localhost:3000
 *       - url: https://doc-web-rose.vercel.app
 *     responses:
 *       200:
 *         description: Успешная аутентификация через Google
 *       401:
 *         description: Ошибка аутентификации
 */
router.get("/auth/google/callback",
    passport.authenticate("google", { failWithError: true, failureMessage: true, failureRedirect: 'https://mojlekarz.netlify.app/login' }), AuthController.googleCallback);
/**
 * @swagger
 * paths:
 *  /forgot-password:
 *    post:
 *      summary: Отправляет ссылку для изменения пароля
 *      description: Получая email существующего пользователя или клиники, отправляет запрос с токеном на изменение пароля на почту. Линк приходит кривой потому что нужен правильный адрес страницы для сброса пароля
 *      operationId: requestPasswordReset
 *      tags: [Auth]
 *      servers:
 *        - url: http://localhost:3000
 *        - url: https://doc-web-rose.vercel.app
 *      requestBody:
 *        description: Email пользователя
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  example: email@gmail.com
 *                  description: Email
 *      responses:
 *        200:
 *          description: Ссылка для сброса пароля была отправлена на ваш адрес электронной почты
 *        404:
 *          description: Пользователь не найден
 */
router.post("/forgot-password", AuthController.requestPasswordReset);
/**
 * @swagger
 * /set-password:
 *   post:
 *     summary: Устанавливает новый пароль для пользователя или клиники
 *     tags: [Auth]
 *     servers:
 *       - url: http://localhost:3000
 *       - url: https://doc-web-rose.vercel.app
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пароль был успешно сброшен
 */
router.post("/set-password", AuthController.setPassword);

module.exports = router;