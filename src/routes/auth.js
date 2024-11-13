const express = require('express');
const router = express.Router();
const passport = require('passport');
const AuthController = require('../controllers/authController');

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Аутентификация пользователя
 *     tags: [Auth]
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
 *               password:
 *                 type: string
 *                 description: Пароль пользователя
 *     responses:
 *       200:
 *         description: Успешная аутентификация
 *       401:
 *         description: Неверные учетные данные
 */
router.post('/login', passport.authenticate('local', { failWithError: true, failureMessage: true, }), AuthController.login);
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userData:
 *                 type: object
 *               patientData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Пользователь успешно зарегистрирован
 *       400:
 *         description: Ошибка валидации данных
 */
router.post('/register', AuthController.register);
/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Выход пользователя из системы
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Успешный выход из системы
 *       500:
 *         description: Ошибка сервера
 */
router.get('/logout', AuthController.logout);
/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Начало аутентификации через Google
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Перенаправление на страницу аутентификации Google
 */
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Callback URL для аутентификации через Google
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Успешная аутентификация через Google
 *       401:
 *         description: Ошибка аутентификации
 */
router.get('/auth/google/callback', passport.authenticate('google', { failWithError: true, failureMessage: true, }), AuthController.login);

module.exports = router;
