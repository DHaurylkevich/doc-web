require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");
const bcrypt = require("bcrypt");

describe("UserController API", () => {
    let userId, sessionCookies;

    after(async () => {
        await db.sequelize.close();
        app.close();
    });
    afterEach(async () => {
        await db.Users.destroy({ where: {} });
    });

    describe("Positive tests", () => {
        describe("GET /api/users/account", () => {
            it("expect to return user data, when user is not clinic", async () => {
                const createdUser = await db.Users.create({
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    phone: faker.phone.number({ style: 'international' }),
                    pesel: 12345678901,
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient",
                    birthday: faker.date.past(30)
                });
                const userId = createdUser.id;
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .get("/api/users/account")
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("id", userId);
                expect(response.body).to.have.property("first_name");
                expect(response.body).to.have.property("address");
            });
            it("expect to return clinic data, when user is clinic", async () => {
                const createdClinic = await db.Clinics.create({
                    name: faker.company.buzzAdjective(),
                    nip: 1234567890,
                    registration_day: faker.date.birthdate(),
                    nr_license: faker.vehicle.vin(),
                    email: faker.internet.email(),
                    phone: faker.phone.number({ style: 'international' }),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    province: faker.location.state(),
                    description: faker.lorem.sentence(),
                    schedule: "Pn-Pt 10:00-18:00"
                });
                const clinicId = createdClinic.id;
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: createdClinic.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .get("/api/users/account")
                    .set('Cookie', sessionCookies)
                    .expect(200);
                console.log(response.body);
                expect(response.body).to.have.property("id", clinicId);
                expect(response.body).to.have.property("name");
                expect(response.body).to.have.property("schedule");
                expect(response.body).to.have.property("address");
            });
        });
        describe("PUT /api/users/password", () => {
            let userId, sessionCookies;
            beforeEach(async () => {
                const fakeUser = {
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

                sessionCookies = res.headers['set-cookie'];
            });
            it("expect to update user password and return 'Password changed successfully', when data valid and it exists", async () => {
                const newPassword = faker.internet.password();

                const response = await request(app)
                    .put(`/api/users/password`)
                    .send({ oldPassword: "123456789", newPassword })
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.deep.equals({ message: "Password changed successfully" });
                const userInDb = await db.Users.findByPk(userId);
                expect(bcrypt.compareSync(newPassword, userInDb.password)).to.be.true;
            });
        });
        describe("DELETE /api/user/:id", () => {
            let userId, sessionCookies;
            beforeEach(async () => {
                const fakeUser = {
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

                sessionCookies = res.headers['set-cookie'];
            });
            it("expect delete user by id, when it exists", async () => {
                const response = await request(app)
                    .delete(`/api/users/${userId}`)
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("message", "Successful delete");
                const userInDb = await db.Users.findByPk(userId);
                expect(userInDb).to.be.null;
            });
        });
    })
    describe("Negative tests", () => {
        describe("GET /api/users/:userId", () => {
            let sessionCookies;
            beforeEach(async () => {
                const fakeUser = {
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

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(res.body).to.have.property("user");

                sessionCookies = res.headers['set-cookie'];
            });
            it("expect to return message: 'User not found', when user with id don't exist", async () => {
                const response = await request(app)
                    .get("/api/users/3")
                    .set('Cookie', sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "User not found");
            });
        });
        describe("PUT /api/users/password", () => {
            it("expect to return message: 'Unauthorized user', when user don't unauthorized", async () => {
                const newPassword = "s";

                const response = await request(app)
                    .put(`/api/users/password`)
                    .send({ oldPassword: "123456789", newPassword })
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect to return message: 'Old password is required', when user with id don't exists", async () => {
                const response = await request(app)
                    .put(`/api/users/password`)
                    .send()
                    .set('Cookie', sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("message", "Old password is required");
            });
            it("expect to return message: 'New password is required', when user with id don't exists", async () => {
                const response = await request(app)
                    .put(`/api/users/password`)
                    .send({ oldPassword: "123456789" })
                    .set('Cookie', sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("message", "New password is required");
            });
            it("expect to return message: 'Password Error', when user with id don't exists", async () => {
                const newPassword = "123456789";

                const response = await request(app)
                    .put(`/api/users/password`)
                    .send({ oldPassword: "12345678", newPassword })
                    .set('Cookie', sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("message", "Password Error");
            });
        });
        describe("DELETE /api/user/:id", () => {
            it("expect to return message: 'Unauthorized user', when user don't unauthorized", async () => {
                const response = await request(app)
                    .delete(`/api/users/${userId}`)
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
        });
    })
});