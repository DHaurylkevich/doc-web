// const sessionStore = require("../config/store");
// const sequelize = require("../config/db");

// const gracefulShutdown = async (io, server) => {
//     console.log("Получен сигнал завершения, закрытие сервера...");

//     // await io.close(() => {
//     //     console.log("Socket.io server closed");
//     // });

//     await sequelize.close();
//     console.log("Database connection closed");

//     sessionStore.close(() => {
//         console.log("Session store closed");
//     });

//     server.close(() => {
//         console.log("HTTP server closed");
//         process.exit(0);
//     });
// };

// module.exports = gracefulShutdown;