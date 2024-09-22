const { Sequelize } = require("sequelize");
require("dotenv").config();
const env = process.env.NODE_ENV || "development";
const config = require("./sequelize.config.json")[env];

let sequelize
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
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