const express = require("express");
const router = express.Router();
const clinicRouter = require("./clinic");
const userRouter = require("./user");
// const { checkAuth, refreshTokenAdmin } = require("../middleware/auth");

router.use("/clinic", clinicRouter);
router.use("/user", userRouter);
// router.use("/order", orderRouter);
// router.use("/contacts", contactRouter);
// router.use("/image", imageRouter);
// router.use("/menu", menuRouter);

// router.get("/auth/check", checkAuth);
// router.get("/auth/refresh", refreshTokenAdmin)

router.get("/", (req, res) => {
    res.send("API")
})

module.exports = router;
