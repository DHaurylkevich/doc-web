require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../doc-web");
const db = require("../../src/models");

describe("ServiceController API", () => {
    let token, fakeService;

    before(async () => {
        await db.sequelize.sync({ force: true });
    });
    beforeEach(async () => {
        fakeService = {
            name: faker.lorem.sentence(),
        };

        // token = authMiddleware.createJWT(userId, fakeUser.role);
    });
    afterEach(async () => {
        await db.Services.destroy({ where: {} });
    });

    describe("POST /api/service", () => {
        it("expect to create service, when data is valid", async () => {
            const response = await request(app)
                .post("/api/service")
                .send({ serviceData: fakeService })
                .expect(201);

            expect(response.body).that.is.a("object");
        });
    });
    describe("GET /api/service", () => {
        let serviceId;
        beforeEach(async () => {
            const createdService = await db.Services.create(fakeService);
            serviceId = createdService.id;
        });
        it("expect services, when they exists", async () => {
            const response = await request(app)
                .get(`/api/service/`)
                .expect(200);

            expect(response.body[0]).to.have.property("id", serviceId);
            expect(response.body[0].name).to.equal(fakeService.name);
        });
    });
    describe("GET /api/service/:id", () => {
        let serviceId;
        beforeEach(async () => {
            const createdService = await db.Services.create(fakeService);
            serviceId = createdService.id;
        });
        it("expect service by id, when it exists", async () => {
            const response = await request(app)
                .get(`/api/service/${serviceId}`)
                .expect(200);

            expect(response.body).to.have.property("id", serviceId);
            expect(response.body.name).to.equal(fakeService.name);
        });
    });
    describe("PUT /api/service/:id", () => {
        let serviceId;
        beforeEach(async () => {
            const createdService = await db.Services.create(fakeService);
            serviceId = createdService.id;
        });
        it("expect to update service, when data valid and it exists", async () => {
            await request(app)
                .put(`/api/service/${serviceId}`)
                .send({ serviceData: { name: "TEST" } })
                .expect(200);

            const serviceInDB = await db.Services.findByPk(serviceId);
            expect(serviceInDB.name).to.equals("TEST");
        });
    });
    describe("DELETE /api/service/:id", () => {
        let serviceId;
        beforeEach(async () => {
            const createdService = await db.Services.create(fakeService);
            serviceId = createdService.id;
        });
        it("expect delete service by id, when it exists", async () => {
            await request(app)
                .delete(`/api/service/${serviceId}`)
                .expect(200);

            const serviceInDb = await db.Services.findByPk(serviceId);
            expect(serviceInDb).to.be.null;
        });
    });
});