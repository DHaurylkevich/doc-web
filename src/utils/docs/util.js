/**
 * @swagger
 * /api/user/role:
 *   post:
 *     summary: checks user role
 *     tags: [Utils]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 example: admin
 *     responses:
 *       201:
 *         description: successfully
 * /api/protected:
 *   get:
 *     summary: To verify that the token is working 
 *     tags: [Utils]
 *     responses:
 *       200:
 *         content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "You have accessed a protected route"
 */