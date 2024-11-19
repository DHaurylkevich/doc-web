const { Server } = require("socket.io");
const chatService = require("../services/chatService");
const messageService = require("../services/messageService");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");
const sessionStore = require("../config/store");

function onlyForHandshake(middleware) {
    return (req, res, next) => {
        const isHandshake = req._query.sid === undefined;
        if (isHandshake) {
            middleware(req, res, next);
        } else {
            next();
        }
    };
}

module.exports = (server, sessionConfig, passport) => {
    const io = new Server(server, {
        connectionStateRecovery: {},
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        cors: {
            origin: "*",
            credentials: true
        }
    });

    io.engine.use(onlyForHandshake(sessionConfig));
    io.engine.use(onlyForHandshake(passport.session()));
    io.engine.use((req, res, next) => {
        if (req.user) {
            next();
        } else {
            res.writeHead(401);
            res.end();
        }
    });

    io.use(async (socket, next) => {
        const sessionID = socket.request.session.id;
        const user = socket.request.session.passport?.user;
        console.log("Данные passport:", user);
        console.log("Session ID:", sessionID);

        let chats;
        chats = await chatService.getChats(user);

        chats.forEach((chat) => {
            socket.join(`chat:${chat.id}`);
        });
        socket.join(`user:${socket.userID}`);
        socket.join(`session:${sessionID}`);

        next();
    });

    io.on("connect", async (socket) => {

        socket.on("channel:create", createChannel({ io, socket, db }));
        socket.on("channel:join", joinChannel({ io, socket, db }));
        socket.on("channel:list", listChannels({ io, socket, db }));
        socket.on("channel:search", searchChannels({ io, socket, db }));

        socket.emit("user:get", users);
        socket.broadcast.emit("user:connect", {
            userId: socket.userID, username: socket.username, connected: true,
        });
        logger.info(`Connection: ${socket.userID} ${socket.id}`);

        socket.on("typing", ({ chatId, userId }) => {
            socket.to(chatId).emit("user:typing", userId);
        });

        // chatId, recipientId, content, fileUrl 
        socket.on("message:send", async ({ to, content }) => {
            // const message = {
            //     // sender_id: user.id,
            //     sender_id: 1,
            //     chat_id: chatId,
            //     // receiver_id: recipientId,
            //     receiver_id: 2,
            //     content,
            //     file_url: fileUrl,
            //     status: "delivered",
            //     timestamp: new Date()
            // };
            // const recipientSocketId = onlineUsers.get(recipientId);
            // if (recipientSocketId) {
            //     io.to(recipientSocketId).emit("receiveMessage", message.content);
            // }
            // let result;
            // try {
            //     result = await messageService.createMessage(message);
            //     console.log(result);
            // } catch (err) {
            //     socket.emit("error", { message: "Error saving message" });
            // }
            logger.info(`SEND MESSAGE ${to} ${socket.userID}`);
            socket.to(to).to(socket.userID).emit("message:send", { content, from: socket.userID, to });
        });

        // if (!socket.recovered) {
        //     try {
        //         const { chatId } = socket.handshake.query;

        //         const messages = await messageService.getMessagesRecoveredForChat(chatId, socket.handshake.auth.serverOffset || 0, 10, 0);
        //         io.emit("chat message", messages.content, messages.id);
        //     } catch (err) {
        //         socket.emit("error", { message: "Error getting messages" });
        //     }
        // }

        // socket.on("readMessage", async ({ messageId }) => {
        //     try {
        //         const message = await messageService.updateMessageStatus(messageId, "read");

        //         const senderSocketId = onlineUsers.get(message.sender_id);
        //         if (senderSocketId) {
        //             io.to(senderSocketId).emit("messageStatus", { messageId, status: "read" });
        //         }
        //     } catch (err) {
        //         socket.emit("error", { message: "Error updating status" });
        //     }
        // });

        // socket.on("user:disconnect", (sessionID) => {
        //     onlineUsers.set(sessionID, {
        //         id: socket.userID,
        //         username: socket.username,
        //         connected: false,
        //     });
        //     logger.info(`user disconnected ${socket.sessionID}`);
        // });

        socket.on("disconnect", async () => {
            const matchingSockets = await io.in(socket.userID).fetchSockets();
            const isDisconnected = matchingSockets.size === 0;

            if (isDisconnected) {
                // onlineUsers.set(socket.sessionID, {
                //     id: socket.userID,
                //     username: socket.username,
                //     connected: false,
                // });

                socket.broadcast.emit("user:disconnect", socket.userID);
                logger.info(`User ${socket.userID} disconnected`);
            }
        });
    });

    return io;
};                          