// const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const swaggerDocument = YAML.load(path.resolve(__dirname, '../utils/docs/swagger.yaml'));

const swaggerSetupOptions = {
    customCssUrl: 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css',
};

module.exports = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerSetupOptions));

    // Явное указание маршрутов для статики Swagger UI
    app.get('/swagger-ui-bundle.js', (req, res) => {
        res.sendFile(require.resolve('swagger-ui-dist/swagger-ui-bundle.js'));
    });

    app.get('/swagger-ui-standalone-preset.js', (req, res) => {
        res.sendFile(require.resolve('swagger-ui-dist/swagger-ui-standalone-preset.js'));
    });

    app.get('/swagger-ui.css', (req, res) => {
        res.sendFile(require.resolve('swagger-ui-dist/swagger-ui.css'));
    });
};
