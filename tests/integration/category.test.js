require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../doc-web");
const db = require("../../src/models");

describe("CategoryController API", () => {
    let token, fakeCategory;

    before(async () => {
        await db.sequelize.sync({ force: true });
    });
    beforeEach(async () => {
        fakeCategory = {
            name: faker.lorem.sentence(),
        };
        // token = authMiddleware.createJWT(userId, fakeUser.role);
    });
    afterEach(async () => {
        await db.Categories.destroy({ where: {} });
    });

    describe("POST /api/categories", () => {
        it("expect to create category, when data is valid", async () => {
            const response = await request(app)
                .post("/api/categories/")
                .send(fakeCategory)
                .expect(201);

            expect(response.body).that.is.a("object");
            expect(response.body).to.include({ name: fakeCategory.name });
        });
    });
    describe("GET /api/categories", () => {
        let testCategory;
        beforeEach(async () => {
            testCategory = await db.Categories.create(fakeCategory);
        });
        it("expect categories, when they exists", async () => {
            const response = await request(app)
                .get(`/api/categories/`)
                .expect(200);

            expect(response.body[0]).to.have.property("id", testCategory.id);
            expect(response.body[0]).to.include({ name: testCategory.name });
        });
    });
    describe("PUT /api/categories/:categoryId", () => {
        let testCategory;
        beforeEach(async () => {
            testCategory = await db.Categories.create(fakeCategory);
        });
        it("expect to update category, when data valid and it exists", async () => {
            await request(app)
                .put(`/api/categories/${testCategory.id}`)
                .send({ name: "TEST" })
                .expect(200);

            const categoryInDB = await db.Categories.findByPk(testCategory.id);
            expect(categoryInDB).to.include({ name: "TEST" });
        });
    });
    describe("DELETE /api/categories/:categoryId", () => {
        let testCategory;
        beforeEach(async () => {
            testCategory = await db.Categories.create(fakeCategory);
        });
        it("expect delete category by id, when it exists", async () => {
            await request(app)
                .delete(`/api/categories/${testCategory.id}`)
                .expect(200);

            const categoryInDb = await db.Categories.findByPk(testCategory.id);
            expect(categoryInDb).to.be.null;
        });
    });
});