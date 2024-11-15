const AppError = require("../utils/appError");
const PatientService = require("../services/patientService");

const AuthController = {
    login: (req, res) => {
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
    },
    register: async (req, res, next) => {
        try {
            const { userData, patientData } = req.body;
            const user = await PatientService.createPatient(userData, patientData);

            req.login(user, (err) => {
                if (err) {
                    throw new AppError("Ошибка во время входа", 500);
                }
                res.json({ user, message: "Регистрация успешна" });
            });
        } catch (err) {
            next(err);
        }
    },
    logout: (req, res) => {
        req.logout((err) => {
            if (err) throw new AppError("Ошибка при выходе", 500);
            res.json({ message: "Выход выполнен успешно" });
        });
    },

    googleCallback: (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError("Пользователь не авторизован", 401);
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
    }
};

module.exports = AuthController;
