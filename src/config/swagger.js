const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "MyLekarz",
        },
        servers: [
            {
                url: process.env.NODE_ENV !== "production"
                    ? "http://localhost:3000/api"
                    : "https://doc-web-rose.vercel.app/api",
                description: "Сюда запросы"
            },
            {
                url: "https://doc-web-rose.vercel.app/api",
                description: "Основной сервер"
            }
        ],
        components: {
            securitySchemes: {
                CookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "token"
                }
            }
        },
    },
    // apis: [path.resolve(__dirname, '../utils/swagger/*.yaml')],
    apis: [path.resolve(__dirname, "../utils/swagger/*.yaml")],
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

    app.get('/swagger.json', (req, res) => {
        res.json(swaggerDocs);
    });
};
