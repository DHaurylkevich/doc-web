require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("PostController API", () => {
    let token, fakePost;

    before(async () => {
        await db.sequelize.sync({ force: true });
    });
    beforeEach(async () => {
        fakePost = {
            photo: "PHOTO",
            title: faker.lorem.sentence(),
            content: faker.lorem.sentence(),
        };
        fakeCategory = {
            name: faker.lorem.sentence(),
        };
        // token = authMiddleware.createJWT(userId, fakeUser.role);
    });
    afterEach(async () => {
        await db.Categories.destroy({ where: {} });
        await db.Posts.destroy({ where: {} });
    });

    describe("POST /api/posts/categories/:categoryId", () => {
        let testCategory;
        beforeEach(async () => {
            testCategory = await db.Categories.create(fakeCategory);
        });
        it("expect to create post by category, when data is valid", async () => {
            const response = await request(app)
                .post(`/api/posts/categories/${testCategory.id}`)
                .send(fakePost)
                .expect(201);

            expect(response.body).that.is.a("object");
            expect(response.body).to.include({ title: fakePost.title });
        });
    });
    describe("GET /api/posts", () => {
        let testCategory, testPost;
        beforeEach(async () => {
            // testCategory = await db.Categories.create(fakeCategory);
            testPost = await db.Posts.create(fakePost);
        });
        it("expect posts, when they exists", async () => {
            const response = await request(app)
                .get(`/api/posts/`)
                .expect(200);

            expect(response.body[0]).to.have.property("id", testPost.id);
            expect(response.body[0]).to.include({ title: testPost.title });
        });
    });
    describe("GET /api/posts/category/:categoryId", () => {
        let testCategory, testPost;
        beforeEach(async () => {
            testCategory = await db.Categories.create(fakeCategory);
            testPost = await db.Posts.create(fakePost);
            await testPost.setCategory(testCategory.id);
        });
        it("expect posts, when they exists", async () => {
            const response = await request(app)
                .get(`/api/posts/categories/${testCategory.id}`)
                .expect(200);

            expect(response.body[0]).to.have.property("id", testPost.id);
            expect(response.body[0].category).to.include({ id: testCategory.id });
        });
    });
    describe("PUT /api/posts/:postId", () => {
        let testPost;
        beforeEach(async () => {
            testPost = await db.Posts.create(fakePost);
        });
        it("expect to update post, when data valid and it exists", async () => {
            await request(app)
                .put(`/api/posts/${testPost.id}`)
                .send({ title: "TEST" })
                .expect(200);

            const categoryInDB = await db.Posts.findByPk(testPost.id);
            expect(categoryInDB).to.include({ title: "TEST" });
        });
    });
    describe("DELETE /api/posts/:postId", () => {
        let testPost;
        beforeEach(async () => {
            testPost = await db.Posts.create(fakePost);
        });
        it("expect delete post by id, when it exists", async () => {
            await request(app)
                .delete(`/api/posts/${testPost.id}`)
                .expect(200);

            const postInDb = await db.Posts.findByPk(testPost.id);
            expect(postInDb).to.be.null;
        });
    });
});