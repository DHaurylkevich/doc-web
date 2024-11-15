const { Server } = require('socket.io');
const SharedSession = require('express-socket.io-session');
const messageService = require('../services/messageService');
const onlineUsers = new Map();

let ioInstance = null;

module.exports = (server, sessionConfig) => {
    if (!ioInstance) {
        ioInstance = new Server(server, { reconnectionAttempts: 5, reconnectionDelay: 1000 });

        ioInstance.use(SharedSession(sessionConfig, { autoSave: true }));

        ioInstance.use((socket, next) => {
            if (socket.request.session && socket.request.session.passport && socket.request.session.passport.user) {
                next();
            } else {
                next(new Error('Unauthorized'));
            }
        });

        ioInstance.on('connection', (socket) => {
            const userId = socket.request.session.passport.user;

            onlineUsers.set(userId, socket.id);

            socket.broadcast.emit('userStatus', { userId, status: 'online' });
            console.log('New connection:', socket.id);

            socket.on('sendMessage', async ({ recipientId, content }) => {
                const message = {
                    sender_id: userId,
                    receiver_id: recipientId,
                    content,
                    status: 'delivered',
                    timestamp: new Date()
                };

                const recipientSocketId = onlineUsers.get(recipientId);
                if (recipientSocketId) {
                    ioInstance.to(recipientSocketId).emit('receiveMessage', message);
                }

                try {
                    await messageService.createMessage(message);
                } catch (err) {
                    socket.emit('error', { message: 'Ошибка при сохранении сообщения' });
                }
            });

            socket.on('readMessage', async ({ messageId }) => {
                try {
                    const message = await messageService.updateMessageStatus(messageId, 'read');

                    const senderSocketId = onlineUsers.get(message.sender_id);
                    if (senderSocketId) {
                        ioInstance.to(senderSocketId).emit('messageStatus', { messageId, status: 'read' });
                    }
                } catch (err) {
                    socket.emit('error', { message: 'Ошибка при обновлении статуса' });
                }
            });

            socket.on('disconnect', () => {
                onlineUsers.delete(userId);
                console.log(`Пользователь ${userId} отключился`);

                socket.broadcast.emit('userStatus', { status: 'offline' });
            });
        });
    }

    return ioInstance;
};