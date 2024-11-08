const { Sequelize } = require("sequelize");
const mysql2 = require("mysql2");
require("dotenv").config();
const env = process.env;
const NODE_ENV = process.env.NODE_ENV || "development";
// const config = require("./sequelize.config.json")[env];
const config = {
    url: env.DATABASE_URL || null,
    username: env.DB_USER || "root",
    password: env.DB_PASS || null,
    database: env.DB_NAME || "mylekarz",
    host: env.DB_HOST || "localhost",
    dialect: 'mysql',
    dialectModule: mysql2,
};

let sequelize
if (config.url) {
    sequelize = new Sequelize(config.url, config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, {
        ...config,
        logging: (msg) => {
            if (msg.includes('ERROR')) {
                console.error(msg);
            }
        },
    });
}

(async () => {
    try {
        await sequelize.authenticate()
        console.log("Database connected");

        if (env.DB_SYNC === "true") {
            console.log("Добавление/Обноаление данных...");
            await sequelize.sync();
            console.log("Начальные данные добавлены/обновлены");
        }
    } catch (err) {
        console.error("Error database connect:", err);
    }
})();

module.exports = sequelize;