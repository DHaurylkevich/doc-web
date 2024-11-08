const UserService = require("../services/userService");
const authMiddleware = require("../middleware/auth");
const passwordUtil = require("../utils/passwordUtil");

const UserController = {
    /**
     * Вход пользователя
     * @param {String} loginParam 
     * @param {String} password
     * @param {*} next 
     */
    loginUser: async (req, res, next) => {
        const { loginParam, password } = req.body;

        try {
            const user = await UserService.findUserByParam(loginParam);

            passwordUtil.checkingPassword(password, user.password);

            const token = authMiddleware.createJWT(user.id, user.role);
            res.status(200).json(token);
        } catch (err) {
            console.log(err);
            next(err);
        }
    },
    /**
     * Получение объекта user и данных по его id и role
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    getUserAccount: async (req, res, next) => {
        const { userId } = req.params;

        try {
            const user = await UserService.getUserById(userId);
            res.status(200).json(user);
        } catch (err) {
            console.error(err);
            next(err);
        }
    },
    /**
     * Обновление паролей
     * @param {Number} req.param.id 
     * @param {String} req.body.oldPassword 
     * @param {String} req.body.newPassword
     * @returns status(200), message: "Password changed successfully"  
     */
    updateUserPassword: async (req, res, next) => {
        const { userId } = req.params;
        const { oldPassword, newPassword } = req.body;
        try {
            if (!userId || !oldPassword || !newPassword) {
                throw new Error("Valid data error");
            }

            await UserService.updatePassword(userId, oldPassword, newPassword);
            res.status(200).json({ message: "Password changed successfully" });
        } catch (err) {
            console.log(err);
            next(err);
        }
    },
    deleteUser: async (req, res, next) => {
        const { userId } = req.params;
        try {
            await UserService.deleteUser(userId);

            res.status(200).json({ message: "Successful delete" });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = UserController;