const { Sequelize } = require("sequelize");
require("dotenv").config();
const env = process.env.NODE_ENV || "development";
// const config = require("./sequelize.config.json")[env];
const config = {
    url: process.env.DATABASE_URL || null,
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || "mylekarz",
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
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
    } catch (err) {
        console.error("Error database connect:", err);
    }
})();

module.exports = sequelize;