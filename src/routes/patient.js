const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");

/**
 * @swagger
 * paths:
 *  /patient/:
 *    post:
 *      summary: Регистрация пациента
 *      description: Возвращает токен доступа при успешной регистрации
 *      operationId: loginUser
 *      tags:
 *        - Patients
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
router.post("/", patientController.registrationPatient);
/**
 * @swagger
 * paths:
 *  /patient/:
 *    get:
 *      summary: Получение пациента с фильтрами
 *      description: Возвращает токен доступа при успешной регистрации
 *      operationId: loginUser
 *      tags:
 *        - Patients
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
router.get("/", patientController.getPatientsFilter);
/**
 * @swagger
 * paths:
 *  /patient/:id:
 *    get:
 *      summary: Пользователь по id
 *      description: Возвращает токен доступа при успешной регистрации
 *      operationId: loginUser
 *      tags:
 *        - Patients
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
// router.get("/:id", patientController.getPatientById);
/**
 * @swagger
 * paths:
 *  /patient/:id:
 *    put:
 *      summary: Получение пользователя по id
 *      description: Возвращает токен доступа при успешной регистрации
 *      operationId: loginUser
 *      tags:
 *        - Patients
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
router.put("/:id", patientController.updatePatientById);

module.exports = router;