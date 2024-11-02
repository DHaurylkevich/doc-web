const express = require("express");
const router = express.Router();
const clinicRouter = require("./clinic");
const userRouter = require("./user");
const patientRouter = require("./patient");
const doctorRouter = require("./doctor");
const serviceRouter = require("./service");
const specialtyRouter = require("./specialty");

// const { checkAuth, refreshTokenAdmin } = require("../middleware/auth");

router.use("/clinics", clinicRouter);
router.use("/users", userRouter);
router.use("/patient", patientRouter);
router.use("/doctors", doctorRouter);
router.use("/services", serviceRouter);
router.use("/specialties", specialtyRouter);
// router.use("/image", imageRouter);
// router.use("/menu", menuRouter);

// router.get("/auth/check", checkAuth);
// router.get("/auth/refresh", refreshTokenAdmin)

router.get("/", (req, res) => {
    res.send("API")
})

module.exports = router;
