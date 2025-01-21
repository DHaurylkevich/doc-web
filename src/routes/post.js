const express = require("express");
const router = express.Router();
const PostController = require("../controllers/postController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

/**
 * @swagger
 * /posts/categories/{categoryId}:
 *   post:
 *     summary: Создать новый пост
 *     description: Создает новый пост с заданными данными.
 *     tags: [Posts]
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         description: ID категирии
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       description: Данные для создания поста
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 example: "Фото для поста"
 *               title:
 *                 type: string
 *                 example: "Заглавие для поста"
 *               content:
 *                 type: string
 *                 example: "Содержание поста"
 *             required:
 *               - photo
 *               - title
 *               - content
 *     responses:
 *       201:
 *         description: Успешное создана поста
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 photo:
 *                   type: string
 *                   example: "Название категории"
 *                 title:
 *                   type: string
 *                   example: "Название категории"
 *                 content:
 *                   type: string
 *                   example: "Название категории"
 */
router.post("/posts/categories/:categoryId", isAuthenticated, hasRole("admin"), PostController.createPost);
/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Получить все посты
 *     description: Возвращает список всех постов.
 *     tags: [Posts]
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Лимит на количество результатов
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: page
 *         in: query
 *         required: false
 *         description: Номер страницы
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Массив постов, сгруппированных по категориям с информацией о количестве страниц
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pages:
 *                   type: integer
 *                   example: 10
 *                 posts:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "801"
 *                         photo:
 *                           type: string
 *                           format: uri
 *                           example: "https://loremflickr.com/3493/3098?lock=693477065326085"
 *                         title:
 *                           type: string
 *                           example: "Ipsum."
 *                         content:
 *                           type: string
 *                           example: "Facilis voluptas similique possimus.\nDolorum veritatis nemo iste odio dignissimos quam.\nIste architecto occaecati debitis distinctio.\nRem modi architecto numquam porro officia ipsam exercitationem commodi.\nAliquid perferendis molestias."
 *                         category:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Games"
 */
router.get("/posts", PostController.getAllPosts);
/**
 * @swagger
 * /posts/categories/{categoryId}:
 *   get:
 *     summary: Получить все посты по категории
 *     description: Возвращает список всех постов определенной категории.
 *     tags: [Posts]
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         description: ID категории
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Массив всех постов по категории 
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   photo:
 *                     type: string
 *                     example: "Фото поста"
 *                   title:
 *                     type: string
 *                     example: "Название поста"
 *                   content:
 *                     type: string
 *                     example: "Текст поста"
 *                   category:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Computers"
 */
router.get("/posts/categories/:categoryId", PostController.getPostsByCategory);
/**
 * @swagger
 * /posts/{postId}:
 *   put:
 *     summary: Обновить пост
 *     description: Обновляет существующуй пост по его ID.
 *     tags: [Posts]
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: ID поста
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       description: Обновленные данные поста
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 example: "Обновленное название записи"
 *               title:
 *                 type: string
 *                 example: "Обновленное название записи"
 *               content:
 *                 type: string
 *                 example: "Обновленное содержание записи"
 *     responses:
 *       200:
 *         description: Пост успешно обновлена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 photo:
 *                   type: string
 *                   example: "Название категории"
 *                 title:
 *                   type: string
 *                   example: "Название категории"
 *                 content:
 *                   type: string
 *                   example: "Название категории"
 */
router.put("/posts/:postId", isAuthenticated, hasRole("admin"), PostController.updatePost);
/**
 * @swagger
 *  /posts/{postId}:
 *   delete:
 *     summary: Удалить пост
 *     description: Удаляет пост по заданному ID.
 *     tags: [Posts]
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: ID поста для удаления
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Пост успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post deleted successfully"
 */
router.delete("/posts/:postId", isAuthenticated, hasRole("admin"), PostController.deletePost);

module.exports = router; 