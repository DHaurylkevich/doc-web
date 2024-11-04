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

// const { checkAuth, refreshTokenAdmin } = require("../middleware/auth");

router.use("/api", clinicRouter);
router.use("/api", userRouter);
router.use("/api", patientRouter);
router.use("/api", doctorRouter);
router.use("/api", serviceRouter);
router.use("/api", specialtyRouter);
router.use("/api", scheduleRouter);
router.use("/api", appointmentRouter);
router.use("/api", reviewRouter);
router.use("/api", tagRouter);
// router.use("/image", imageRouter);
// router.use("/menu", menuRouter);

// router.get("/auth/check", checkAuth);
// router.get("/auth/refresh", refreshTokenAdmin)

router.get("/", (req, res) => {
    res.send("API")
})

module.exports = router;
