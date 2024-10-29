const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/login", userController.loginUser);
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Возвращает информацию о пользователе по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *       404:
 *         description: Пользователь не найден
 */
router.get("/:id", userController.getUserByIdAndRole);

router.put("/password/:id", userController.updateUserPassword);

router.delete("/:id", userController.deleteUser);

module.exports = router;