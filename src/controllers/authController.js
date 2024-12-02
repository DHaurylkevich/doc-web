const AppError = require("../utils/appError");
const AuthService = require("../services/authService");
const createPatient = require("../services/patientService").createPatient;

const AuthController = {
    login: (req, res) => {
        console.log(req.user);
        const userResponse = {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
            first_name: req.user.first_name,
            last_name: req.user.last_name
        };
        if (req.user.doctor.clinic_id) {
            userResponse.clinic_id = req.user.doctor.clinic_id;
        }

        res.status(200).json({
            message: "Login successful",
            user: userResponse
        });
    },
    register: async (req, res, next) => {
        const { userData, patientData } = req.body;

        try {
            const user = await createPatient(userData, patientData);

            req.login(user, (err) => {
                if (err) {
                    throw new AppError("Error during login", 500);
                }
                res.json({ user, message: "Registration successful" });
            });
        } catch (err) {
            next(err);
        }
    },
    logout: (req, res) => {
        req.logout((err) => {
            if (err) throw new AppError("Error during logout", 500);
            res.json({ message: "Logout successful" });
        });
    },

    googleCallback: (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError("User is not authorized", 401);
            }

            const userResponse = {
                id: req.user.id,
                email: req.user.email,
                role: req.user.role,
                first_name: req.user.first_name,
                last_name: req.user.last_name
            };

            res.status(200).json({
                message: "Успешный вход",
                user: userResponse
            });
        } catch (err) {
            next(err);
        }
    },
    requestPasswordReset: async (req, res, next) => {
        const { email } = req.body;

        try {
            await AuthService.requestPasswordReset(email);
            res.status(200).json({ message: "Password reset link has been sent to your email address" });
        } catch (err) {
            next(err);
        }
    },
    setPassword: async (req, res, next) => {
        const { token, newPassword } = req.body;

        try {
            await AuthService.setPassword(token, newPassword);
            res.status(201).json({ message: "Password has been reset" });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = AuthController;
