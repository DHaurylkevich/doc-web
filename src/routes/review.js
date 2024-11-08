const express = require("express");
const router = express.Router();
const ReviewController = require("../controllers/reviewController");

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Создать новую запись
 *     description: Создает новую запись с заданными данными.
 *     tags:
 *       - Reviews
 *     requestBody:
 *       description: Данные для создания записи
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: number
 *                 example: 1
 *               doctorId:
 *                 type: string
 *                 example: 1
 *               rating:
 *                 type: number
 *                 example: 2
 *               comment:
 *                 type: string
 *                 example: "Комментарий"
 *               tagsIds:
 *                 type: array
 *                 example: [1,2,3]
 *             required:
 *               - patientId
 *               - doctorId
 *               - rating
 *               - comment
 *               - tagsIds
 *     responses:
 *       201:
 *         description: Успешно созданый комментарий
 */
router.post("/reviews/", ReviewController.createReview);
/**
 * @swagger
 * /clinics/{clinicId}/reviews:
 *   get:
 *     summary: Получить все комментарии
 *     description: Возвращает комментарии связанные с одной клиникой.
 *     tags:
 *       - Reviews
 *     parameters:
 *       - name: clinicId
 *         in: path
 *         required: true
 *         description: ID клиники для поиска
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Массив всех комментариев
 */
router.get("/clinics/:clinicId/reviews", ReviewController.getAllReviewsByClinic);
/**
 * @swagger
 * /doctors/{doctorId}/reviews:
 *   get:
 *     summary: Получить все комментарии
 *     description: Возвращает комментарии связанные с одним доктором.
 *     tags:
 *       - Reviews
 *     parameters:
 *       - name: doctorId
 *         in: path
 *         required: true
 *         description: ID доктора для поиска
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Массив всех комментариев
 */
router.get("/doctors/:doctorId/reviews", ReviewController.getAllReviewsByDoctor);

// router.put("/patients/:id", ReviewController.updatePatientById);
/**
 * @swagger
 * /reviews/{reviewId}:
 *   delete:
 *     summary: Удалить комментарий
 *     description: Удаляет комментарий по заданному ID.
 *     tags:
 *       - Reviews
 *     parameters:
 *       - name: reviewId
 *         in: path
 *         required: true
 *         description: ID комментария для удаления
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Комментарий успешно удален
 */
router.delete("/reviews/:reviewId", ReviewController.deleteReview);

module.exports = router;