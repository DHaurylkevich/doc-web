const chatController = require("../controllers/chatController");
const { isAuthenticated, hasRole } = require('../middleware/auth');

const router = require("express").Router();
/**
 * @swagger
 * paths:
 *   /chats:
 *     post:
 *       summary: Создать чат
 *       description: Создает новый чат между двумя пользователями.
 *       tags:
 *         - Chats
 *       requestBody:
 *         description: Данные для создания чата.
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user2Id:
 *                   type: integer
 *                   description: ID пользователя, с которым создается чат.
 *                 user2Role:
 *                   type: string
 *                   description: Роль пользователя, с которым создается чат.
 *                   enum:
 *                     - doctor
 *                     - admin
 *                     - clinic
 */
router.post("/chats", isAuthenticated, chatController.createChat);
/**
 * @swagger
 * paths:
 *   /chats:
 *     get:
 *       summary: Получить все чаты пользователя
 *       tags:
 *         - Chats
 *       responses:
 *         200:
 *           description: Список чатов пользователя успешно получен.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   schema:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Уникальный идентификатор чата
 *                       user_1_id:
 *                         type: integer
 *                         description: ID первого пользователя
 *                       user_1_type:
 *                         type: string
 *                         description: Тип первого пользователя (user или clinic)
 *                       user_2_id:
 *                         type: integer
 *                         description: ID второго пользователя
 *                       user_2_type:
 *                         type: string
 *                         description: Тип второго пользователя (user или clinic)
 *                       user1:
 *                         type: object
 *                         description: Данные первого пользователя
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID первого пользователя
 *                           first_name:
 *                             type: string
 *                             description: Имя первого пользователя
 *                           last_name:
 *                             type: string
 *                             description: Фамилия первого пользователя
 *                           photo:
 *                             type: string
 *                             description: Фото первого пользователя
 *                       clinic1:
 *                         type: object
 *                         description: Данные первой клиники
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID первой клиники
 *                           name:
 *                             type: string
 *                             description: Название первой клиники
 *                           photo:
 *                             type: string
 *                             description: Фото первой клиники
 *                       user2:
 *                         type: object
 *                         description: Данные второго пользователя
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID второго пользователя
 *                           first_name:
 *                             type: string
 *                             description: Имя второго пользователя
 *                           last_name:
 *                             type: string
 *                             description: Фамилия второго пользователя
 *                           photo:
 *                             type: string
 *                             description: Фото второго пользователя
 *                       clinic2:
 *                         type: object
 *                         description: Данные второй клиники
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID второй клиники
 *                           name:
 *                             type: string
 *                             description: Название второй клиники
 *                           photo:
 *                             type: string
 *                             description: Фото второй клиники
 *                       messages:
 *                         type: array
 *                         description: Сообщения в чате
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               description: ID сообщения
 *                             content:
 *                               type: string
 *                               description: Содержимое сообщения
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                               description: Дата и время создания сообщения
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Дата и время создания чата
 *         401:
 *           description: Пользователь не авторизован.
 *         500:
 *           description: Внутренняя ошибка сервера.
 */
router.get("/chats", isAuthenticated, chatController.getChats);
/**
 * @swagger
 * paths:
 *   /chats/{chatId}:
 *     get:
 *       summary: Получить чат по ID
 *       tags:
 *         - Chats
 *       parameters:
 *         - name: chatId
 *           in: path
 *           required: true
 *           description: ID чата
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Чат успешно получен.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID чата
 *                   user1:
 *                     type: object
 *                     description: Данные первого пользователя
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID первого пользователя
 *                       first_name:
 *                         type: string
 *                         description: Имя первого пользователя
 *                       last_name:
 *                         type: string
 *                         description: Фамилия первого пользователя
 *                       photo:
 *                         type: string
 *                         description: Фото первого пользователя
 *                   clinic1:
 *                     type: object
 *                     description: Данные первой клиники
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID первой клиники
 *                       name:
 *                         type: string
 *                         description: Название первой клиники
 *                       photo:
 *                         type: string
 *                         description: Фото первой клиники
 *                   user2:
 *                     type: object
 *                     description: Данные второго пользователя
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID второго пользователя
 *                       first_name:
 *                         type: string
 *                         description: Имя второго пользователя
 *                       last_name:
 *                         type: string
 *                         description: Фамилия второго пользователя
 *                       photo:
 *                         type: string
 *                         description: Фото второго пользователя
 *                   clinic2:
 *                     type: object
 *                     description: Данные второй клиники
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID второй клиники
 *                       name:
 *                         type: string
 *                         description: Название второй клиники
 *                       photo:
 *                         type: string
 *                         description: Фото второй клиники
 *                   messages:
 *                     type: array
 *                     description: Сообщения в чате
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: ID сообщения
 *                         content:
 *                           type: string
 *                           description: Содержимое сообщения
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           description: Дата и время создания сообщения
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: Дата и время создания чата
 *         401:
 *           description: Пользователь не авторизован.
 *         404:
 *           description: Чат не найден.
 *         500:
 *           description: Внутренняя ошибка сервера.
 */
router.get("/chats/:chatId", isAuthenticated, chatController.getChatById);
/**
 * @swagger
 * paths:
 *   /chats/{chatId}:
 *     delete:
 *       summary: Удалить чат по ID
 *       tags:
 *         - Chats
 *       parameters:
 *         - name: chatId
 *           in: path
 *           required: true
 *           description: ID чата
 *       responses:
 *         200:
 *           description: Чат успешно удален.
 */
router.delete("/chats/:chatId", isAuthenticated, chatController.deleteChat);

module.exports = router;