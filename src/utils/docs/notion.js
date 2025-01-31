/**
 * @swagger
 * /notions:
 *   post:
 *     summary: Create a new notion
 *     tags: [Notions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Notion text"
 *             required:
 *               - content
 *     responses:
 *       201:
 *         description: Notion successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 content:
 *                   type: string
 *                   example: "Notion text"
 *   get:
 *     summary: Get all notions
 *     tags: [Notions]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                     example: 1
 *                   content:
 *                     type: string
 *                     example: "Notion content"
 * /notions/{notionId}:
 *   put:
 *     summary: Update a notion
 *     tags: [Notions]
 *     parameters:
 *       - name: notionId
 *         in: path
 *         required: true
 *         description: notion ID
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
 *               content:
 *                 type: string
 *                 example: "Updated notion content"
 *             required:
 *               - content
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                   example: "Updated notion content"
 *   delete:
 *     summary: Delete a notion
 *     tags: [Notions]
 *     parameters:
 *       - name: notionId
 *         in: path
 *         required: true
 *         description: notion ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notion successfully deleted"
 */