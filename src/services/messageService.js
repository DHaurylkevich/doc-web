const db = require("../models");
const AppError = require("../utils/appError");

const messageService = {
    createMessage: async (messageData) => {
        return await db.Messages.create(messageData);
    },
    getMessagesByChatId: async (chatId, limit, offset) => {
        const chat = await db.Chats.findByPk(chatId);
        if (!chat) {
            throw new AppError("Chat not found", 404);
        }
        return await chat.getMessages({ limit, offset });
    },
    updateMessageStatus: async (messageId, status) => {
        return await db.Messages.update({ status }, { where: { id: messageId } });
    },
    deleteMessage: async (messageId) => {
        return await db.Messages.destroy({ where: { id: messageId } });
    }
};

module.exports = messageService;