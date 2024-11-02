const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");

/**
 * @swagger
 * paths:
 *  /doctor/:
 *    post:
 *      summary: Создание доктора
 *      description: Создание доктора с возможностью определить специальзации
 *      operationId: loginUser
 *      tags:
 *        - Doctors
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                loginParam:
 *                  type: string
 *                  description: Логин (email, телефон или pesel) пользователя
 *                password:
 *                  type: string
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
router.post("/", doctorController.createDoctor);

// router.get("/doctors", doctorController);

router.get("/:id/short", doctorController.getShortDoctorById);

router.get("/:id", doctorController.getDoctorById);

router.put("/:id", doctorController.updateDoctorById);

router.get('/clinics/:clinicId/', doctorController.getDoctorsByClinicWithSorting);

module.exports = router;