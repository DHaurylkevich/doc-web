const chatService = require("../services/chatService");
const logger = require("../utils/logger");

const startChatWithMessage = async ({ io, socket, to, content }) => {
    try {
        const chatId = await chatService.createChat(socket.user, to);

        socket.emit("message:send", { chatId, to, content })

        io.in(`user:${socket.user.id}`).socketsJoin(`chat:${chatId}`); // всех устройств с комнаты в чат 
        socket.to(`user:${socket.user.id}`).emit("chat:start", { chatId }); // уведомление о начале чата

        io.in(`user:${to}`).socketsJoin(`chat:${chatId}`); // всех устройств с комнаты в чат 
        io.to(`user:${to}`).emit("chat:start", { chatId });// уведомление о начале чата

        logger.info(`user ${socket.user.id} has joined channel ${chatId}`);
        logger.info(`user ${to.id} has joined channel ${chatId}`);
    } catch (err) {
        logger.error(err);
        socket.emit("error", { message: "Ошибка при создании чата" });
    }
}
const listChats = async ({ socket }) => {
    const chats = await chatService.getChats(socket.user);
    return chats;
}
const searchChats = async ({ io, socket, db }) => {
    socket.on("chat:search", searchChats({ io, socket, db }));
}

module.exports = {
    startChatWithMessage,
    listChats,
    searchChats
};
