const { Sequelize } = require("sequelize");
// const mysql2 = require("mysql2");
// const NODE_ENV = process.env.NODE_ENV || "development";

const config = {
    url: process.env.POSTGRES_PRISMA_URL || null,
    username: process.env.POSTGRES_USER || "root",
    password: process.env.POSTGRES_PASSWORD || null,
    database: process.env.POSTGRES_DATABASE || "mylekarz",
    host: process.env.POSTGRES_HOST || "localhost",
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: (msg) => {
        if (msg.includes('ERROR')) {
            console.error(msg);
        }
    },
    // dialect: "mysql",
    // dialectModule: mysql2,
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

        if (process.env.DB_SYNC === "true") {
            console.log("Добавление/Обноаление данных...");
            // await sequelize.sync({ alter: true });

            await sequelize.sync({ force: true });
            console.log("Начальные данные добавлены/обновлены");
        }
    } catch (err) {
        console.error("Error database connect:", err);
    }
})();

module.exports = sequelize;