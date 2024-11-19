const router = require("express").Router();
const messageController = require("../controllers/messageController");
const { uploadFiles } = require("../middleware/upload");

router.post("/chats/:chatId/messages", uploadFiles.single("file"), messageController.createMessage);
/**
 * @swagger
 * /chats/{chatId}/messages:
 *   get:
 *     summary: Получить сообщения чата
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID чата
 *     responses:
 *       200:
 *         description: Список сообщений
 *       404:
 *         description: Чат не найден
 */
router.get("/users/chats/:chatId/messages", messageController.getMessages);
/**
 * @swagger
 * /users/messages/{messageId}:
 *   delete:
 *     summary: Удалить сообщение
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID сообщения
 *     responses:
 *       200:
 *         description: Сообщение успешно удалено
 *       404:
 *         description: Сообщение не найдено
 */
router.delete("/users/messages/:messageId", messageController.deleteMessage);

module.exports = router;