/**
 * @swagger
 * /clinics/timetable:
 *   put:
 *     summary: update timestamp
 *     tags: [Timetable]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timetablesData:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     dayOfWeek:
 *                       type: integer
 *                       example: 1
 *                     startTime:
 *                       type: string
 *                       format: time
 *                       example: "09:00"
 *                     endTime:
 *                       type: string
 *                       format: time
 *                       example: "18:00"
 *                 required:
 *                   - id
 *                   - dayOfWeek
 *                   - startTime
 *                   - endTime
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
 *                     type: integer
 *                     example: 1
 *                   clinic_id:
 *                     type: integer
 *                     example: 1
 *                   day_of_week:
 *                     type: integer
 *                     example: 1
 *                   start_time:
 *                     type: string
 *                     example: "09:00:00"
 *                   end_time:
 *                     type: string
 *                     example: "18:00:00"
 */ 