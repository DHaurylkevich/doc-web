const express = require("express");
const router = express.Router();
const SearchController = require("../controllers/searchController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

/**
 * @swagger
 * /search/posts:
 *   get:
 *     summary: Получить все посты
 *     description: Возвращает список всех постов.
 *     tags:
 *       - Search
 *     parameters:
 *       - name: query
 *         in: query
 *         description: Строка поиска, пример Home
 *         required: true
 *         schema:
 *           type: string
 *           example: Home
 *       - name: page
 *         in: query
 *         description: Номер страницы
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Количество постов на странице
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Массив всех постов
 */
router.get("/search/posts", SearchController.searchPosts);
/**
 * @swagger
 * /search/patients:
 *   get:
 *     summary: Получить все посты
 *     description: Возвращает список всех постов.
 *     tags:
 *       - Search
 *     parameters:
 *       - name: query
 *         in: query
 *         description: Строка поиска, пример Home
 *         required: true
 *         schema:
 *           type: string
 *           example: Home
 *       - name: page
 *         in: query
 *         description: Номер страницы
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Количество постов на странице
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Массив всех постов
 */
router.get("/search/patients", isAuthenticated, hasRole(["clinic", "doctor", "admin"]), SearchController.searchPatients);
/**
 * @swagger
 * /search/doctors:
 *   get:
 *     summary: Получить все посты
 *     description: Возвращает список всех постов.
 *     tags:
 *       - Search
 *     parameters:
 *       - name: query
 *         in: query
 *         description: Строка поиска, пример Home
 *         required: true
 *         schema:
 *           type: string
 *           example: Home
 *       - name: page
 *         in: query
 *         description: Номер страницы
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Количество постов на странице
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Массив всех постов
 */
router.get("/search/doctors", isAuthenticated, hasRole(["clinic", "admin"]), SearchController.searchDoctors);
/**
 * @swagger
 * /search/clinics:
 *   get:
 *     summary: Получить все посты
 *     description: Возвращает список всех постов.
 *     tags:
 *       - Search
 *     parameters:
 *       - name: query
 *         in: query
 *         description: Строка поиска, пример Home
 *         required: true
 *         schema:
 *           type: string
 *           example: Home
 *       - name: page
 *         in: query
 *         description: Номер страницы
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Количество постов на странице
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Массив всех постов
 */
router.get("/search/clinics", isAuthenticated, hasRole("admin"), SearchController.searchClinics);
/**
 * @swagger
 * /search/prescriptions:
 *   get:
 *     summary: Получить все посты
 *     description: Возвращает список всех постов.
 *     tags:
 *       - Search
 *     parameters:
 *       - name: query
 *         in: query
 *         description: Строка поиска, пример Home
 *         required: true
 *         schema:
 *           type: string
 *           example: Home
 *       - name: page
 *         in: query
 *         description: Номер страницы
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Количество постов на странице
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Массив всех постов
 */
router.get("/search/prescriptions", isAuthenticated, hasRole("doctor"), SearchController.searchPrescriptions);

module.exports = router; 