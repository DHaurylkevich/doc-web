require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../doc-web");
const db = require("../../src/models");
const passwordUtil = require("../../src/utils/passwordUtil");

describe("UserController API", () => {
    let token, fakeUser, userId;

    before(async () => {
        await db.sequelize.sync({ force: true });
    });
    beforeEach(async () => {
        fakeUser = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            phone: faker.phone.number({ style: 'international' }),
            pesel: 12345678,
            password: "Test@1234",
            role: "patient",
            birthday: faker.date.past(30)
        };
        const createdUser = await db.Users.create(fakeUser);
        userId = createdUser.id;

        // token = authMiddleware.createJWT(userId, fakeUser.role);
    });
    afterEach(async () => {
        await db.Users.destroy({ where: {} });
    });

    describe("POST /api/user", () => {
        it("expect token, when user exists and data is valid", async () => {
            const loginParam = fakeUser.email;
            const password = "Test@1234";

            const response = await request(app)
                .post("/api/user/login")
                .send({ loginParam, password })
                .expect(200);

            expect(response.body).that.is.a("string");
        });
    });
    describe("GET /api/user/:id", () => {
        it("expect user by id, when it exists", async () => {
            const response = await request(app)
                .get(`/api/user/${userId}`)
                .send({ role: fakeUser.role })
                .expect(200);

            expect(response.body).to.have.property("id", userId);
            expect(response.body.first_name).to.equal(fakeUser.first_name);
        });
    });
    describe("PUT /api/user/:id", () => {
        it("expect to update user password, when data valid and it exists", async () => {
            const response = await request(app)
                .put(`/api/user/password/${userId}`)
                .send({ oldPassword: "Test@1234", newPassword: "TEST" })
                .expect(200);

            expect(response.body).to.deep.equals({ message: "Password changed successfully" });
            const userInDb = await db.Users.findByPk(userId);
            passwordUtil.checkingPassword("TEST", userInDb.password);
        });
    });
    describe("DELETE /api/user/:id", () => {
        it("expect delete user by id, when it exists", async () => {
            await request(app)
                .delete(`/api/user/${userId}`)
                .expect(200);

            const userInDb = await db.Users.findByPk(userId);
            expect(userInDb).to.be.null;
        });
    });
});