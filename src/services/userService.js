const { models } = require("../models");
const User = models.users;
const medical_centers = models.medical_centers;

const UserService = {
    createUser: async (userData) => {
        try {
            const userFound = await User.findOne({ where: { email: userData.email } });
            if (userFound) {
                throw new Error("User already exist");
            }

            if (userData.role === "doctor") {
                const center = await medical_centers.findOne({ where: { center_id: userData.center_id } });
                if (!center) {
                    throw new Error("Medical center not found");
                }
            }

            return await User.create(userData)
        } catch (e) {
            console.error("Error occurred", e);
            throw new Error(e.message);
        }
    }
}

module.exports = UserService;
// CreateUser создает пользователя в базе даных. Данные в сервис уже приходят правильными. Можно создать три вида пользователя: Admin, Patient, Doctor. При создании пользователя проверяется есть ли пользователь уже в Базе Данных. Чтобы cоздать доктора, нужно чтобы был корректный существующий center_id