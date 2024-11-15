const { Op } = require("sequelize");
const db = require("../models");
const AppError = require("../utils/appError");

const chatService = {
    createChat: async (user, user2Id, user2Role) => {
        let user2;
        if ("clinic" === user2Role) {
            user2 = await db.Clinics.findByPk(user2Id);
            if (!user2) {
                throw new AppError("Clinic not found", 404);
            }
        } else {
            user2 = await db.Users.findByPk(user2Id);
            if (!user2) {
                throw new AppError("User not found", 404);
            }
            user2Role = "user";
        }

        const chat = await db.Chats.create({
            user_1_id: user.id,
            user_1_type: user.role !== "clinic" ? "user" : user.role,
            user_2_id: user2.id,
            user_2_type: user2Role
        });
        return chat;
    },
    getChats: async (user) => {
        user.role = user.role !== "clinic" ? "user" : user.role;

        const chats = await db.Chats.findAll({
            where: {
                [Op.or]: [
                    { user_1_id: user.id, user_1_type: user.role },
                    { user_2_id: user.id, user_2_type: user.role }
                ]
            },
            include: [
                { model: db.Users, as: 'user1', attributes: ['id', 'first_name', 'last_name', 'photo'] },
                { model: db.Clinics, as: 'clinic1', attributes: ['id', 'name', 'photo'] },
                { model: db.Users, as: 'user2', attributes: ['id', 'first_name', 'last_name', 'photo'] },
                { model: db.Clinics, as: 'clinic2', attributes: ['id', 'name', 'photo'] },
                { model: db.Messages, as: 'messages', limit: 1, order: [['created_at', 'DESC']] }
            ]
        });
        return chats;
    },
    // getChatById: async (chatId) => {
    //     const chat = await db.Chats.findByPk(chatId, {
    //         include: [
    //             { model: db.Users, as: 'user1', attributes: ['id', 'first_name', 'last_name', 'photo'] },
    //             { model: db.Clinics, as: 'clinic1', attributes: ['id', 'name', 'photo'] },
    //             { model: db.Users, as: 'user2', attributes: ['id', 'first_name', 'last_name', 'photo'] },
    //             { model: db.Clinics, as: 'clinic2', attributes: ['id', 'name', 'photo'] },
    //             { model: db.Messages, as: 'messages' }
    //         ]
    //     });
    //     return chat;
    // },
    deleteChat: async (chatId) => {
        const chat = await db.Chats.destroy({
            where: { id: chatId }
        });
        return chat;
    }
};

module.exports = chatService;