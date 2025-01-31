/**
 * @swagger
 * /tags:
 *   post:
 *     summary: create a new tag
 *     tags: [Tags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Tag's name"
 *             required:
 *               - name
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Tag's name"
 *                 positive:
 *                   type: boolean
 *                   example: true
 *   get:
 *     summary: get all tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Массив всех тэгов
 * /tags/{tagId}:
 *   put:
 *     summary: update tag
 *     tags: [Tags]
 *     parameters:
 *       - name: tagId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New tag"
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Тэг успешно обновлен
 *   delete:
 *     summary: delete the tag
 *     tags: [Tags]
 *     parameters:
 *       - name: tagId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Таг успешно удален
 */