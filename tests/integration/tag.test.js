require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../doc-web");
const db = require("../../src/models");

describe("TagController API", () => {
    let token, fakeTag;

    before(async () => {
        await db.sequelize.sync({ force: true });
    });
    beforeEach(async () => {
        fakeTag = { name: faker.lorem.paragraph(), positive: false };

        // token = authMiddleware.createJWT(userId, fakeUser.role);
    });
    afterEach(async () => {
        await db.Tags.destroy({ where: {} });
    });

    describe("POST /api/tags", () => {
        it("expect to create tag, when data is valid", async () => {
            const response = await request(app)
                .post("/api/tags")
                .send(fakeTag)
                .expect(201);

            expect(response.body).that.is.a("object");
            expect(response.body.name).to.equal(fakeTag.name);
            expect(response.body.positive).to.equal(fakeTag.positive);
        });
    });
    describe("GET /api/tags/", () => {
        it("expect tags, when they exists", async () => {
            const testTag = await db.Tags.create(fakeTag);

            const response = await request(app)
                .get("/api/tags")
                .expect(200);

            expect(response.body).to.be.an("array").that.is.not.empty;
            expect(response.body[0]).to.include({ positive: testTag.positive });
            expect(response.body[0]).to.include({ name: testTag.name });
        });
    });
    describe("PUT /api/tags/:id", () => {
        it("expect to update tag, when data valid and it exists", async () => {
            const testTag = await db.Tags.create(fakeTag);

            await request(app)
                .put(`/api/tags/${testTag.id}`)
                .send({ name: "TEST" })
                .expect(200);

            const tagInDB = await db.Tags.findByPk(testTag.id);
            expect(tagInDB).to.include({ positive: testTag.positive });
            expect(tagInDB).to.include({ name: "TEST" });
        });
    });
    describe("DELETE /api/tag/:id", () => {
        it("expect delete tag by id, when it exists", async () => {
            const testTag = await db.Tags.create(fakeTag);

            await request(app)
                .delete(`/api/tags/${testTag.id}`)
                .expect(200);

            const tagInDb = await db.Services.findByPk(testTag.id);
            expect(tagInDb).to.be.null;
        });
    });
});