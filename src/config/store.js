const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql2 = require("mysql2");

const options = {
    host: process.env.DB_HOST || "localhost",
    port: 3306,
    user: process.env.DB_USER || "root",
    url: process.env.DATABASE_URL || null,
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || "mylekarz",
    dialect: "mysql",
    dialectModule: mysql2,
    createDatabaseTable: true,
    schema: {
        tableName: 'Sessions',
        //     columnNames: {
        //         session_id: 'session_id',
        //         expires: 'expires',
        //         data: 'data'
        // }
    },
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000,
};

const sessionStore = new MySQLStore(options);

sessionStore.onReady().catch(error => {
    console.error("Failed to initialize MySQLStore:", error);
    process.exit(1);
});

module.exports = sessionStore;