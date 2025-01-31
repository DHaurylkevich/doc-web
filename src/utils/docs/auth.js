/**
 * @swagger
 * /login:
 *   post:
 *     summary: User authentication
 *     tags: [Auth]
 *     servers:
 *       - url: http://localhost:3000
 *       - url: https://doc-web-rose.vercel.app
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               loginParam:
 *                 type: string
 *                 description: User's email, phone, or PESEL
 *                 example: "doctor@gmail.com"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "123456789"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     servers:
 *       - url: http://localhost:3000
 *       - url: https://doc-web-rose.vercel.app
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "test@gmail.com"
 *               password:
 *                 type: string
 *                 example: "123456789"
 * /logout:
 *   get:
 *     summary: User logout
 *     tags: [Auth]
 *     servers:
 *       - url: http://localhost:3000
 *       - url: https://doc-web-rose.vercel.app
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 * /auth/google:
 *   get:
 *     summary: Start Google authentication
 *     tags: [Auth]
 *     servers:
 *       - url: http://localhost:3000
 *       - url: https://doc-web-rose.vercel.app
 * /auth/google/callback:
 *   get:
 *     summary: Google authentication callback URL
 *     tags: [Auth]
 *     servers:
 *       - url: http://localhost:3000
 *       - url: https://doc-web-rose.vercel.app
 *   /forgot-password:
 *     post:
 *       summary: Sends a password reset link
 *       description: Sends a password reset token to the email of an existing user or clinic. The link may be malformed because the correct password reset page address is needed.
 *       tags: [Auth]
 *       servers:
 *         - url: http://localhost:3000
 *         - url: https://doc-web-rose.vercel.app
 *       requestBody:
 *         description: User's email
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   example: email@gmail.com
 *                   description: Email
 * /forgot-password:
 *   post:
 *     summary: Sends a link to change the password
 *     description: Receiving the email of an existing user or clinic, sends a request with a password reset token to the email. The link comes out crooked because it needs the correct page address to reset the password
 *     tags: [Auth]
 *     servers:
 *       - url: http://localhost:3000
 *       - url: https://doc-web-rose.vercel.app
 *     requestBody:
 *       description: Email пользователя
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: email@gmail.com
 *                 description: Email
 *     responses:
 *       200:
 *         description: A password reset link has been sent to your email address
 * /set-password:
 *   post:
 *     summary: Sets a new password for the user or clinic
 *     tags: [Auth]
 *     servers:
 *       - url: http://localhost:3000
 *       - url: https://doc-web-rose.vercel.app
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 */