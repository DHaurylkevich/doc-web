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
            price: 10.10,
        };
        // token = authMiddleware.createJWT(userId, fakeUser.role);
    });
    afterEach(async () => {
        await db.Services.destroy({ where: {} });
    });

    describe("POST /api/clinic/:id/services", () => {
        let fakeClinic;
        beforeEach(async () => {
            fakeClinic = { name: faker.company.buzzAdjective(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }), description: faker.lorem.sentence(), schedule: "Date" };
        });
        it("expect to create service, when data is valid", async () => {
            const createdClinic = await db.Clinics.create(fakeClinic);
            const specialtiesInDb = await db.Specialties.create({ name: "Cardiology" });
            const specialtyId = specialtiesInDb.id;

            const response = await request(app)
                .post(`/api/clinic/${createdClinic.id}/services`)
                .send({ name: fakeService.name, price: fakeService.price, specialtyId })
                .expect(201);
                
            expect(response.body).that.is.a("object");
        });
    });
    describe("GET /api/services", () => {
        let serviceId;
        beforeEach(async () => {
            const createdService = await db.Services.create(fakeService);
            serviceId = createdService.id;
        });
        it("expect services, when they exists", async () => {
            const response = await request(app)
                .get(`/api/services/`)
                .expect(200);

            expect(response.body[0]).to.have.property("id", serviceId);
            expect(response.body[0].name).to.equal(fakeService.name);
        });
    });
    describe("GET /api/services/:id", () => {
        let serviceId;
        beforeEach(async () => {
            const createdService = await db.Services.create(fakeService);
            serviceId = createdService.id;
        });
        it("expect service by id, when it exists", async () => {
            const response = await request(app)
                .get(`/api/services/${serviceId}`)
                .expect(200);

            expect(response.body).to.have.property("id", serviceId);
            expect(response.body.name).to.equal(fakeService.name);
        });
    });
    describe("PUT /api/services/:id", () => {
        let serviceId;
        beforeEach(async () => {
            const createdService = await db.Services.create(fakeService);
            serviceId = createdService.id;
        });
        it("expect to update service, when data valid and it exists", async () => {
            await request(app)
                .put(`/api/services/${serviceId}`)
                .send({ serviceData: { name: "TEST" } })
                .expect(200);

            const serviceInDB = await db.Services.findByPk(serviceId);
            expect(serviceInDB.name).to.equals("TEST");
        });
    });
    describe("DELETE /api/services/:id", () => {
        let serviceId;
        beforeEach(async () => {
            const createdService = await db.Services.create(fakeService);
            serviceId = createdService.id;
        });
        it("expect delete service by id, when it exists", async () => {
            await request(app)
                .delete(`/api/services/${serviceId}`)
                .expect(200);

            const serviceInDb = await db.Services.findByPk(serviceId);
            expect(serviceInDb).to.be.null;
        });
    });
});