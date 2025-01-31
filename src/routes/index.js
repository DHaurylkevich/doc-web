const express = require("express");
const router = express.Router();
const clinicRouter = require("./clinic");
const userRouter = require("./user");
const patientRouter = require("./patient");
const doctorRouter = require("./doctor");
const serviceRouter = require("./service");
const specialtyRouter = require("./specialty");
const scheduleRouter = require("./schedule");
const appointmentRouter = require("./appointments");
const reviewRouter = require("./review");
const tagRouter = require("./tag");
const categoryRouter = require("./category");
const postRouter = require("./post");
const notionRouter = require("./notion");
const medicationRouter = require("./medication");
const prescriptionRouter = require("./prescription");
const authRouter = require("./auth");
const chatRouter = require("./chat");
const messageRouter = require("./messages");
const timetableRouter = require("./timetables");
const searchRouter = require("./search");
const statisticRouter = require("./statistics");
const { isAuthenticated, hasRole } = require('../middleware/auth');
const upload = require("../middleware/upload").uploadFiles;

router.use("/", authRouter);
router.use("/api", searchRouter);
router.use("/api", statisticRouter);

router.use("/api", appointmentRouter);
router.use("/api", clinicRouter);
router.use("/api", userRouter);
router.use("/api", patientRouter);
router.use("/api", doctorRouter);
router.use("/api", serviceRouter);
router.use("/api", specialtyRouter);
router.use("/api", scheduleRouter);
router.use("/api", reviewRouter);
router.use("/api", tagRouter);
router.use("/api", categoryRouter);
router.use("/api", postRouter);
router.use("/api", notionRouter);
router.use("/api", medicationRouter);
router.use("/api", prescriptionRouter);
router.use("/api", chatRouter);
router.use("/api", messageRouter);
router.use("/api", timetableRouter);

router.post("/api/user/role", (req, res, next) => {
    const role = req.body.role;
    hasRole(role)(req, res, next);
}, (req, res) => {
    res.status(201).json("Successful");
});

//TODO: удалить при завершении
router.get("/api/get-username", isAuthenticated, (req, res) => {
    res.status(200).json({ name: req.user.role });
});

//TODO: удалить при завершении
router.post("/api/upload/file", upload.single("file"), (req, res) => {
    res.json({ message: "File uploaded successfully", fileUrl: req.file.path });
});

router.get("/api/protected", isAuthenticated, (req, res) => {
    res.status(200).json({ message: `You have accessed a protected route.` });
});

router.get("/api", (req, res) => {
    res.send("API");
})

module.exports = router;