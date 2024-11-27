require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");
const passwordUtil = require("../../src/utils/passwordUtil");

describe("UserController API", () => {
    let fakeUser, userId, sessionCookies;

    // before(async () => {
    //     await db.sequelize.sync({ force: true });
    // });

    beforeEach(async () => {
        fakeUser = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            phone: faker.phone.number({ style: 'international' }),
            pesel: 12345678901,
            password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
            role: "patient",
            birthday: faker.date.past(30)
        };
        const createdUser = await db.Users.create(fakeUser);
        userId = createdUser.id;

        const res = await request(app)
            .post('/login')
            .send({
                loginParam: fakeUser.email,
                password: "123456789"
            })
            .expect(200);

        expect(res.body).to.have.property("user");

        sessionCookies = res.headers['set-cookie']
    });
    afterEach(async () => {
        await db.Users.destroy({ where: {} });
    });

    describe("GET /api/users/account", () => {
        it("expect to return user data", async () => {
            const response = await request(app)
                .get("/api/users/account")
                .set('Cookie', sessionCookies)
                .expect(200);

                expect(response.body).to.have.property("id", userId);
                expect(response.body).to.have.property("first_name");
                expect(response.body).to.have.property("last_name");            
        })
    })
    describe("PUT /api/user/:id/password", () => {
        it("expect to update user password, when data valid and it exists", async () => {
            const response = await request(app)
                .put(`/api/users/${userId}/password`)
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
                .delete(`/api/users/${userId}`)
                .expect(200);

            const userInDb = await db.Users.findByPk(userId);
            expect(userInDb).to.be.null;
        });
    });
});