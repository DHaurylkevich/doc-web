const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
// const MySQLStore = require('express-mysql-session')(session);
// const mysql2 = require("mysql2");
// const options = {
//     url: process.env.DATABASE_URL || null,
//     username: process.env.DB_USER || "root",
//     password: process.env.DB_PASS || null,
//     database: process.env.DB_NAME || "mylekarz",
//     host: process.env.DB_HOST || "localhost",
//     dialect: "mysql",
//     dialectModule: mysql2,
//     port: 3306,
//     createDatabaseTable: true,
//     schema: {
//         tableName: 'Sessions',
//         //     columnNames: {
//         //         session_id: 'session_id',
//         //         expires: 'expires',
//         //         data: 'data'
//         // }
//     },
//     clearExpired: true,
//     checkExpirationInterval: 900000,
//     expiration: 86400000,
// };
// const sessionStore = new MySQLStore(options);

const sessionStore = new pgSession({
    conString: process.env.POSTGRES_PRISMA_URL || "postgres://postgres:password@localhost/mylekarz",
    tableName: 'session'
});

module.exports = sessionStore;