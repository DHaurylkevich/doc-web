const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const option = {
    definition:{
        openapi: "3.0.0",
        info: {
            title: "MyLekarz",
            version: "1.0.0",
            description: 'Описание API для проекта',
        } 
    },
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(option);

module.exports = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}