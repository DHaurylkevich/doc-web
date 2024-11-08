const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

// Настройки Swagger
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "MyLekarz",
            version: "1.0.0",
            description: 'Описание API для проекта',
        },
    },
    apis: [path.resolve(__dirname, '../routes/*.js')],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const swaggerSetupOptions = {
    customCssUrl: 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css',
};

module.exports = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerSetupOptions));

    // Явное указание маршрутов для статики Swagger UI
    app.get('/swagger-ui-bundle.js', (req, res) => {
        res.sendFile(require.resolve('swagger-ui-dist/swagger-ui-bundle.js'));
    });

    app.get('/swagger-ui-standalone-preset.js', (req, res) => {
        res.sendFile(require.resolve('swagger-ui-dist/swagger-ui-standalone-preset.js'));
    });

    // Эндпоинт для JSON спецификации API (для Swagger UI)
    app.get('/swagger.json', (req, res) => {
        res.json(swaggerDocs);
    });
};
