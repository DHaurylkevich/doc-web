/**
 * @swagger
 * /clinics/doctors:
 *   post:
 *     summary: Create a new doctor
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userData:
 *                 type: object
 *                 properties:
 *                   first_name:
 *                     type: string
 *                     example: "Stive"
 *                   last_name:
 *                     type: string
 *                     example: "Jobs"
 *                   email:
 *                     type: string
 *                     example: "jobse220@mail.com"
 *                   gender:
 *                     type: string
 *                     enum: ["male", "female"]
 *                     example: "male"
 *                   pesel:
 *                     type: string
 *                     example: "12345678901"
 *                   phone:
 *                     type: string
 *                     example: "+48123123123"
 *                   birthday:
 *                     type: string
 *                     format: date
 *                     example: "1980-01-01"
 *               addressData:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                     example: "Effertzhaven"
 *                   province:
 *                     type: string
 *                     example: "Ohio"
 *                   street:
 *                     type: string
 *                     example: "N Chestnut Street"
 *                   home:
 *                     type: string
 *                     example: "7903"
 *                   flat:
 *                     type: string
 *                     example: "495"
 *                   post_index:
 *                     type: string
 *                     example: "37428-7078"
 *               doctorData:
 *                 type: object
 *                 properties:
 *                   hired_at:
 *                     type: string
 *                     format: date
 *                     example: "2023-01-01"
 *                   description:
 *                     type: string
 *                     example: "Dr dre eeeee"
 *               specialtyId:
 *                 type: integer
 *                 example: 5
 *               servicesIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Doctor created successfully"
 * /doctors/{doctorId}/short:
 *   get:
 *     summary: Get a short information about doctor
 *     tags: [Doctors]
 *     parameters:
 *       - name: doctorId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 description:
 *                   type: string
 *                   example: "loren longer"
 *                 rating:
 *                   type: number
 *                   format: float
 *                   example: 0.5
 *                 user:
 *                   type: object
 *                   properties:
 *                     first_name:
 *                       type: string
 *                       example: "Name"
 *                     last_name:
 *                       type: string
 *                       example: "Last Name"
 *                     photo:
 *                       type: string
 *                       example: "https://example.com/"
 *                 specialty:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Special Name"
 * /doctors/{doctorId}:
 *   get:
 *     summary: Get a doctor's information
 *     tags: [Doctors]
 *     parameters:
 *       - name: doctorId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 18
 *                 description:
 *                   type: string
 *                   example: "Tabella ager ventus cupiditate demulceo."
 *                 rating:
 *                   type: number
 *                   format: float
 *                   example: 3.3
 *                 hired_at:
 *                   type: string
 *                   example: "2024-10-04T17:41:40.320Z"
 *                 user:
 *                   type: object
 *                   properties:
 *                     first_name:
 *                       type: string
 *                       example: "Jarret"
 *                     last_name:
 *                       type: string
 *                       example: "Douglas"
 *                     gender:
 *                       type: string
 *                       example: "female"
 *                     photo:
 *                       type: string
 *                       example: "https://example.com"
 *                     email:
 *                       type: string
 *                       example: "doctor@gmail.com"
 *                     address:
 *                       type: object
 *                       properties:
 *                         city:
 *                           type: string
 *                           example: "Novogrudek"
 *                         province:
 *                           type: string
 *                           example: "Ghrodnenska"
 *                         street:
 *                           type: string
 *                           example: "st. Mickiewicha"
 *                         home:
 *                           type: string
 *                           example: "69"
 *                         flat:
 *                           type: string
 *                           example: "96"
 *                         post_index:
 *                           type: string
 *                           example: "123456"
 *                 specialty:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Agent"
 *                     services:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "X-ray"
 *                 clinic:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Larson - Schmidt"
 * /admins/doctors:
 *   get:
 *     summary: Получить все допустимые данные о врачах для админа
 *     tags: [Doctors]
 *     parameters:
 *       - name: gender
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [male, female]
 *           example: "male"
 *         description: Пол доктора
 *       - name: sort
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           example: "asc"
 *         description: Сортировка по имени
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
 *         description: Успешно возвращены полные данные врача
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: Уникальный идентификатор врача
 *                   example: 18
 *                 description:
 *                   type: string
 *                   example: "Tabella ager ventus cupiditate demulceo."
 *                 rating:
 *                   type: number
 *                   format: float
 *                   example: 3.4528073983690954
 *                 hired_at:
 *                   type: string
 *                   example: "2024-10-04T17:41:40.320Z"
 *                 user:
 *                   type: object
 *                   properties:
 *                     first_name:
 *                       type: string
 *                       example: "Jarret"
 *                     last_name:
 *                       type: string
 *                       example: "Douglas"
 *                     gender:
 *                       type: string
 *                       example: "female"
 *                     photo:
 *                       type: string
 *                       example: "https://exapmle.com"
 *                     email:
 *                       type: string
 *                       example: "doctor@gmail.com"
 *                     address:
 *                       type: object
 *                       properties:
 *                         city:
 *                           type: string
 *                           example: "Novogrudek"
 *                         province:
 *                           type: string
 *                           example: "Ghrodnenska"
 *                         street:
 *                           type: string
 *                           example: "st. Mickiewicha"
 *                         home:
 *                           type: string
 *                           example: "69"
 *                         flat:
 *                           type: string
 *                           example: "96"
 *                         post_index:
 *                           type: string
 *                           example: "123456"
 *                 specialty:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Agent"
 *                 clinic:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Larson - Schmidt"
 * /clinics/doctors/{doctorId}:
 *   put:
 *     summary: Клиника может обновить информацию о своем докторе  
 *     tags: [Doctors]
 *     parameters:
 *       - name: doctorId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID доктора
 *     requestBody:
 *       description: Данные для обновления доктора
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userData:
 *                 type: object
 *                 description: Данные пользователя
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: "new_email@gmail.com"
 *                   phone:
 *                     type: string
 *                     example: "+1234567890"
 *               addressData:
 *                 type: object
 *                 description: Адрес доктора
 *                 properties:
 *                   city:
 *                     type: string
 *                     example: "Effertzhaven"
 *                   province:
 *                     type: string
 *                     example: "Ohio"
 *                   street:
 *                     type: string
 *                     example: "N Chestnut Street"
 *                   home:
 *                     type: integer
 *                     example: "7903"
 *                   flat:
 *                     type: integer
 *                     example: "495"
 *                   post_index:
 *                     type: string
 *                     example: "37428-7078"
 *               doctorData:
 *                 type: object
 *                 description: Данные доктора
 *                 properties:
 *                   hired_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-11-13T07:29:36.618Z"
 *                   description:
 *                     type: string
 *                     example: "Corroboro avaritia pecto suadeo. Claudeo aestas comitatus. Benigne spargo appono denuncio terra."
 *                   specialty_id:
 *                     type: integer
 *                     example: 2
 *               servicesIds:
 *                 type: array
 *                 description: Массив ID услуг доктора
 *                 items:
 *                   type: integer
 *                 example: [2]
 *     responses:
 *       200:
 *         description: Данные доктора успешно обновлены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Doctor update successfully"
 * /clinics/{clinicId}/doctors:
 *   get:
 *     summary: Получить всех докторов связанные с одной клинникой с фильтрацией
 *     tags: [Doctors]
 *     parameters:
 *       - name: clinicId
 *         in: path
 *         required: true
 *         description: ID клиники для поиска
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: gender
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [male, female]
 *           example: "male"
 *         description: Пол доктора
 *       - name: sort
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           example: "ASC"
 *         description: Сортировка по имени
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
 *         description: Массив всех докторов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 18
 *                   user:
 *                     type: object
 *                     properties:
 *                       first_name:
 *                         type: string
 *                         example: "Janiya"
 *                       last_name:
 *                         type: string
 *                         example: "Ward"
 *                       gender:
 *                         type: string
 *                         example: "female"
 *                   specialty:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Associate"
 */