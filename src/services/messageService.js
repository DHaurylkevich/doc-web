const db = require("../models");
const AppError = require("../utils/appError");

const messageService = {
    createMessage: async (messageData) => {
        return await db.Messages.create(messageData);
    },
    getMessagesByChatId: async ({ chatId, userId, limit = 10, offset = 0 }) => {
        try {
            const messages = await db.Chats.findByPk(chatId, {
                attributes: ['id'],
                where: { '$chatParticipants.user_id$': userId },
                include: [
                    {
                        model: db.Messages,
                        as: 'messages',
                        limit,
                        offset
                    }]
            });

            return messages;
        } catch (err) {
            throw new AppError(err, 404);
        }
    },
    getMessageById: async (messageId) => {
        return await db.Messages.findByPk(messageId);
    },
    // getMessagesRecoveredForChat: async (chatId, serverOffset, limit, offset) => {
    //     const messages = await db.Messages.findAll({
    //         where: {
    //             id: {
    //                 [Op.gt]: serverOffset
    //             },
    //             chat_id: chatId,
    //         },
    //         limit,
    //         offset
    //     });
    //     if (!messages) {
    //         throw new AppError("Messages not found", 404);
    //     }
    //     return messages;
    // },
    updateMessageStatus: async (messageId, status) => {
        return await db.Messages.update({ status }, { where: { id: messageId } });
    },
    deleteMessage: async (messageId) => {
        return await db.Messages.destroy({ where: { id: messageId } });
    }
};

module.exports = messageService;