require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("NotionController API", () => {
    let token, fakeNotion;

    before(async () => {
        await db.sequelize.sync({ force: true });
    });
    beforeEach(async () => {
        fakeNotion = {
            content: faker.lorem.sentence(),
        };
        // token = authMiddleware.createJWT(userId, fakeUser.role);
    });
    afterEach(async () => {
        await db.Notions.destroy({ where: {} });
    });

    describe("POST /api/notions", () => {
        it("expect to create notion, when data is valid", async () => {
            const response = await request(app)
                .post("/api/notions")
                .send(fakeNotion)
                .expect(201);

            expect(response.body).that.is.a("object");
            expect(response.body).to.include({ content: fakeNotion.content });
        });
    });
    describe("GET /api/notions", () => {
        let testNotion;
        beforeEach(async () => {
            testNotion = await db.Notions.create(fakeNotion);
        });
        it("expect posts, when they exists", async () => {
            const response = await request(app)
                .get("/api/notions")
                .expect(200);

            expect(response.body[0]).to.have.property("id", testNotion.id);
            expect(response.body[0]).to.include({ content: testNotion.content });
        });
    });
    // describe("PUT /api/posts/:postId", () => {
    //     let testPost;
    //     beforeEach(async () => {
    //         testPost = await db.Posts.create(fakePost);
    //     });
    //     it("expect to update post, when data valid and it exists", async () => {
    //         await request(app)
    //             .put(`/api/posts/${testPost.id}`)
    //             .send({ title: "TEST" })
    //             .expect(200);

    //         const categoryInDB = await db.Posts.findByPk(testPost.id);
    //         expect(categoryInDB).to.include({ title: "TEST" });
    //     });
    // });
    describe("DELETE /api/notions/:postId", () => {
        let testNotion;
        beforeEach(async () => {
            testNotion = await db.Notions.create(fakeNotion);
        });
        it("expect delete post by id, when it exists", async () => {
            await request(app)
                .delete(`/api/notions/${testNotion.id}`)
                .expect(200);

            const postInDb = await db.Notions.findByPk(testNotion.id);
            expect(postInDb).to.be.null;
        });
    });
});