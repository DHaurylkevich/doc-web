const express = require("express");
const router = express.Router();
const passport = require("passport");
const AppError = require("../utils/appError");
const AuthController = require("../controllers/authController");

router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new AppError(info.message || "Invalid credentials", 404));
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return AuthController.login(req, res, next, info);
        });
    })(req, res, next);
});

router.post("/register", AuthController.register);

router.get("/logout", AuthController.logout);

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/auth/google/callback",
    passport.authenticate("google", { failWithError: true, failureMessage: true, failureRedirect: 'https://mojlekarz.netlify.app/login' }), AuthController.googleCallback);

router.post("/forgot-password", AuthController.requestPasswordReset);

router.post("/set-password", AuthController.setPassword);

module.exports = router;