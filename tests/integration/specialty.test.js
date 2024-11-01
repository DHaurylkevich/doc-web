require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../doc-web");
const db = require("../../src/models");

describe("SpecialtyController API", () => {
    let token, fakeSpecialty;

    before(async () => {
        await db.sequelize.sync({ force: true });
    });
    beforeEach(async () => {
        fakeSpecialty = {
            name: faker.lorem.sentence(),
        };

        // token = authMiddleware.createJWT(userId, fakeUser.role);
    });
    afterEach(async () => {
        await db.Specialties.destroy({ where: {} });
    });

    describe("POST /api/specialty", () => {
        it("expect to create specialty, when data is valid", async () => {
            const response = await request(app)
                .post("/api/specialty")
                .send({ specialtyData: fakeSpecialty })
                .expect(201);

            expect(response.body).that.is.a("object");
            expect(response.body.name).to.deep.equals(fakeSpecialty.name);
        });
    });
    describe("GET /api/specialty", () => {
        let specialtyId;
        beforeEach(async () => {
            const createdSpecialty = await db.Specialties.create(fakeSpecialty);
            specialtyId = createdSpecialty.id;
        });
        it("expect specialties, when they exist", async () => {
            const response = await request(app)
                .get("/api/specialty/")
                .expect(200);

            expect(response.body[0]).to.have.property("id", specialtyId);
            expect(response.body[0].name).to.equal(fakeSpecialty.name);
        });
    });
    describe("GET /api/specialty/:id", () => {
        let specialtyId;
        beforeEach(async () => {
            const createdSpecialty = await db.Specialties.create(fakeSpecialty);
            specialtyId = createdSpecialty.id;
        });
        it("expect specialty by id, when it exists", async () => {
            const response = await request(app)
                .get(`/api/specialty/${specialtyId}`)
                .expect(200);

            expect(response.body).to.have.property("id", specialtyId);
            expect(response.body.name).to.equal(fakeSpecialty.name);
        });
    });
    describe("PUT /api/specialty/:id", () => {
        let specialtyId;
        beforeEach(async () => {
            const createdSpecialty = await db.Specialties.create(fakeSpecialty);
            specialtyId = createdSpecialty.id;
        });
        it("expect to update specialty, when data valid and it exists", async () => {
            await request(app)
                .put(`/api/specialty/${specialtyId}`)
                .send({ specialtyData: { name: "TEST" } })
                .expect(200);

            const specialtyInDB = await db.Specialties.findByPk(specialtyId);
            expect(specialtyInDB.name).to.equals("TEST")
        });
    });
    describe("DELETE /api/specialty/:id", () => {
        let specialtyId;
        beforeEach(async () => {
            const createdSpecialty = await db.Specialties.create(fakeSpecialty);
            specialtyId = createdSpecialty.id;
        });
        it("expect delete service by id, when it exists", async () => {
            await request(app)
                .delete(`/api/specialty/${specialtyId}`)
                .expect(200);

            const specialtyInDb = await db.Specialties.findByPk(specialtyId);
            expect(specialtyInDb).to.be.null;
        });
    });
});