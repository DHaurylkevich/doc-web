const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");

/**
 * @swagger
 * paths:
 *  /specialty:
 *    post:
 *      summary: Создает услуги привязанные к клиннике и специальности 
 *      description: Создает новую специальность при корректных данных и роли администратора
 *      operationId: createSpecialty
 *      tags:
 *        - Services
 *      requestBody:
 *        description: Данные для создания специальности
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                specialtyData:
 *                  type: object
 *                  description: Объект данных специальности
 *                  properties:
 *                    name:
 *                      type: string
 *                      example: "хирург"
 *                      description: Название специальности
 *      responses:
 *        201:
 *          description: Успешное создание специальности
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: integer
 *                    example: 1
 *                  name:
 *                    type: string
 *                    example: "Хирург"
 *        400:
 *          description: Неверные данные запроса
 *        401:
 *          description: Ошибка авторизации - требуется роль администратора
 *        404:
 *          description: Специальность не найдена
 */
router.post("/clinic/:clinicId/services", serviceController.createService);

router.get("/services", serviceController.getAllServices);

router.get("/services/:id", serviceController.getService);

router.put("/services/:id", serviceController.updateService);

router.delete("/services/:id", serviceController.deleteService);

module.exports = router;