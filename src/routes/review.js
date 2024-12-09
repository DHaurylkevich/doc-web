const express = require("express");
const router = express.Router();
const ReviewController = require("../controllers/reviewController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Создать новую запись
 *     description: Создает новую запись с заданными данными, может создавать только patient.
 *     tags:
 *       - Reviews
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       description: Данные для создания записи
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *               - doctorId
 *               - rating
 *               - comment
 *               - tagsIds
 *     responses:
 *       201:
 *         description: Успешное создание специальности
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review created successfully"
 */
router.post("/reviews/", isAuthenticated, hasRole("patient"), ReviewController.createReview);
/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Получить все комментарии, может получсть только админ
 *     tags:
 *       - Reviews
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Массив всех комментариев
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   comment:
 *                     type: string
 *                     example: "Alius speculum tener subiungo conscendo ter incidunt aeternus."
 *                   rating:
 *                     type: number
 *                     example: 2
 *                   doctor:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 10
 *                       description:
 *                         type: string
 *                         example: "Adulatio concedo calamitas cinis aspernatur curvo illum solus."
 *                       rating:
 *                         type: number
 *                         example: 2.089517892795714
 *                       user:
 *                         type: object
 *                         properties:
 *                           first_name:
 *                             type: string
 *                             example: "Charlotte"
 *                           last_name:
 *                             type: string
 *                             example: "Schumm"
 *                   patient:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 18
 *                       user:
 *                         type: object
 *                         properties:
 *                           first_name:
 *                             type: string
 *                             example: "Zora"
 *                           last_name:
 *                             type: string
 *                             example: "Lemke"
 *                           photo:
 *                             type: string
 *                             example: "https://avatars.githubusercontent.com/u/82634702"
 *               tags:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 10
 *                   name:
 *                     type: string
 *                     example: "Expensive prices"
 */
router.get("/reviews", isAuthenticated, hasRole("admin"), ReviewController.getAllReviews);
/**
 * @swagger
 * /reviews/{reviewId}:
 *   delete:
 *     summary: Удалить комментарий
 *     description: Удаляет комментарий по заданному ID, может только админ
 *     tags:
 *       - Reviews
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - name: reviewId
 *         in: path
 *         required: true
 *         description: ID комментария для удаления
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       201:
 *         description: Успешное удаление специальности
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review deleted successfully"
 */
router.delete("/reviews/:reviewId", isAuthenticated, hasRole("admin"), ReviewController.deleteReview);
/**
 * @swagger
 * /clinics/{clinicId}/reviews:
 *   get:
 *     summary: Получить все комментарии для клиники
 *     description: Возвращает комментарии, связанные с одной клиникой.
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
 *         description: Массив всех комментариев для клиники
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 67
 *                   comment:
 *                     type: string
 *                     example: "Distinctio curiositas anser."
 *                   rating:
 *                     type: integer
 *                     example: 1
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-11-30T15:38:11.666Z"
 *                   doctor:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 18
 *                       description:
 *                         type: string
 *                         example: "Impedit verumtamen tener aureus bellum tenax adficio cultura."
 *                       rating:
 *                         type: number
 *                         format: float
 *                         example: 4.3
 *                       user_id:
 *                         type: integer
 *                         example: 36
 *                       user:
 *                         type: object
 *                         properties:
 *                           first_name:
 *                             type: string
 *                             example: "Janiya"
 *                           last_name:
 *                             type: string
 *                             example: "Ward"
 *                   patient:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 16
 *                       user:
 *                         type: object
 *                         properties:
 *                           first_name:
 *                             type: string
 *                             example: "Norma"
 *                           last_name:
 *                             type: string
 *                             example: "Borer"
 *                           photo:
 *                             type: string
 *                             example: "https://avatars.githubusercontent.com/u/88169697"
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 3
 *                         name:
 *                           type: string
 *                           example: "Friendly staff"
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
 *         description: Массив всех комментариев для клиники
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   comment:
 *                     type: string
 *                     example: "Distinctio curiositas anser."
 *                   rating:
 *                     type: integer
 *                     example: 1
 *                   patient:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 16
 *                       user:
 *                         type: object
 *                         properties:
 *                           first_name:
 *                             type: string
 *                             example: "Norma"
 *                           last_name:
 *                             type: string
 *                             example: "Borer"
 *                           photo:
 *                             type: string
 *                             example: "https://avatars.githubusercontent.com/u/88169697"
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 3
 *                         name:
 *                           type: string
 *                           example: "Friendly staff"
 */
router.get("/doctors/:doctorId/reviews", ReviewController.getAllReviewsByDoctor);

module.exports = router;