const { models } = require("../models");
const User = models.users;
const medical_centers = models.medical_centers;



exports.createUser = async (user) => {
    try {
        if (user.role === "doctor") {
            const center = await medical_centers.findOne({ where: { center_id: user.center_id } });
            if (!center) {
                throw new Error("Medical center not found");
            }
        }

        return await User.create(user)
    } catch (e) {
        console.error("Error occurred", e);
        throw new Error(e.message);
    }
}

// CreateUser создает пользователя в базе даных. Данные в сервис уже приходят правильными. Можно создать три вида пользователя: Admin, Patient, Doctor. Чтобы чоздать доктора, нужно чтобы был корректный существующий center_id