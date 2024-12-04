require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("ServiceController API", () => {
    let fakeService;

    beforeEach(async () => {
        fakeService = {
            name: faker.lorem.sentence(),
            price: 10.10,
        };
    });
    afterEach(async () => {
        await db.Services.destroy({ where: {} });
    });

    describe("Positive tests", () => {
        describe("POST /api/clinics/:id/services", () => {
            let fakeClinic, sessionCookies;

            before(async () => {
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
                await db.Users.create(fakeUser);

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(res.body).to.have.property("user");

                sessionCookies = res.headers['set-cookie'];
                fakeClinic = { name: faker.company.buzzAdjective(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }), description: faker.lorem.sentence(), schedule: "Date", password: faker.internet.password() };
            });
            after(async () => {
                await db.Users.destroy({ where: {} });
            });
            it("expect to create service, when data is valid", async () => {
                const createdClinic = await db.Clinics.create(fakeClinic);
                const specialtiesInDb = await db.Specialties.create({ name: "Cardiology" });
                const specialtyId = specialtiesInDb.id;

                const response = await request(app)
                    .post(`/api/clinics/${createdClinic.id}/services`)
                    .send({ name: fakeService.name, price: fakeService.price, specialtyId })
                    .set('Cookie', sessionCookies)
                    .expect(201);

                expect(response.body).that.is.a("object");
                expect(response.body).have.property("name", fakeService.name);
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
                expect(response.body[0]).have.property("name", fakeService.name);
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
                expect(response.body).have.property("name", fakeService.name);
            });
        });
        describe("PUT /api/services/:id", () => {
            let serviceId;

            before(async () => {
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
                await db.Users.create(fakeUser);

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");

                sessionCookies = res.headers['set-cookie'];
                const createdService = await db.Services.create(fakeService);
                serviceId = createdService.id;
            });
            after(async () => {
                await db.Users.destroy({ where: {} });
            });
            it("expect to update service, when data valid and it exists", async () => {
                await request(app)
                    .put(`/api/services/${serviceId}`)
                    .send({ serviceData: { name: "TEST" } })
                    .set('Cookie', sessionCookies)
                    .expect(200);

                const serviceInDB = await db.Services.findByPk(serviceId);
                expect(serviceInDB.name).to.equals("TEST");
            });
        });
        describe("DELETE /api/services/:id", () => {
            let serviceId;
            before(async () => {
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
                await db.Users.create(fakeUser);

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");

                sessionCookies = res.headers['set-cookie'];

                const createdService = await db.Services.create(fakeService);
                serviceId = createdService.id;
            });
            afterEach(async () => {
                await db.Users.destroy({ where: {} });
            });
            it("expect delete service by id, when it exists", async () => {
                await request(app)
                    .delete(`/api/services/${serviceId}`)
                    .set('Cookie', sessionCookies)
                    .expect(200);

                const serviceInDb = await db.Services.findByPk(serviceId);
                expect(serviceInDb).to.be.null;
            });
        });
    })
    describe("Negative tests", () => {
        describe("POST /api/clinics/:id/services", () => {
            let fakeClinic, createdClinic, specialtiesInDb, specialtyId;

            before(async () => {
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

                sessionCookies = res.headers['set-cookie'];

                fakeClinic = { name: faker.company.buzzAdjective(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }), description: faker.lorem.sentence(), schedule: "Date", password: faker.internet.password() };
                createdClinic = await db.Clinics.create(fakeClinic);
                specialtiesInDb = await db.Specialties.create({ name: "Cardiology" });
                specialtyId = specialtiesInDb.id;
            });
            after(async () => {
                await db.Users.destroy({ where: {} });
            });
            it("expect return 400 error when creating a service without a name", async () => {
                const response = await request(app)
                    .post(`/api/clinics/${createdClinic.id}/services`)
                    .send({ price: fakeService.price, specialtyId })
                    .set('Cookie', sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("error");
                expect(response.body).to.have.property("message", "Name is required");
            });
            it("expect return 400 error when creating a service without a price", async () => {
                const response = await request(app)
                    .post(`/api/clinics/${createdClinic.id}/services`)
                    .send({ name: fakeService.name, specialtyId })
                    .set('Cookie', sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("error");
                expect(response.body).to.have.property("message", "Price is required");
            });
            it("expect return 400 error when creating a service without a specialtyId", async () => {
                const response = await request(app)
                    .post(`/api/clinics/${createdClinic.id}/services`)
                    .send({ name: fakeService.name, price: fakeService.price })
                    .set('Cookie', sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("error");
                expect(response.body).to.have.property("message", "SpecialtyId is required");
            });
            it("expect return 401 error when attempting to create a service without authentication", async () => {
                const fakeClinic = { name: faker.company.buzzAdjective(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }), description: faker.lorem.sentence(), schedule: "Date", password: faker.internet.password() };
                const createdClinic = await db.Clinics.create(fakeClinic);
                const specialtiesInDb = await db.Specialties.create({ name: "Cardiology" });
                const specialtyId = specialtiesInDb.id;

                const response = await request(app)
                    .post(`/api/clinics/${createdClinic.id}/services`)
                    .send({ name: "Test Service", price: 10.10, specialtyId })
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect return 409 error when this service exist", async () => {
                const fakeClinic = { name: faker.company.buzzAdjective(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }), description: faker.lorem.sentence(), schedule: "Date", password: faker.internet.password() };
                const createdClinic = await db.Clinics.create(fakeClinic);
                const specialtiesInDb = await db.Specialties.create({ name: "Cardiology" });
                const specialtyId = specialtiesInDb.id;
                const createdService = await db.Services.create({ ...fakeService, specialty_id: specialtyId, clinic_id: createdClinic.id });
                console.log(createdService);

                const response = await request(app)
                    .post(`/api/clinics/${createdClinic.id}/services`)
                    .send({ name: createdService.name, price: createdService.price, specialtyId, clinic_id: createdClinic.id })
                    .set('Cookie', sessionCookies)
                    .expect(409);

                expect(response.body).to.have.property("message", "Service already exists");
            });
        });
        describe("GET /api/services/:id", () => {
            it("expect service by id, when it exists", async () => {
                const response = await request(app)
                    .get("/api/services/1")
                    .expect(404);

                expect(response.body).to.have.property("message", "Service not found");
            });
        });
        describe("PUT /api/services/:id", () => {
            before(async () => {
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

                sessionCookies = res.headers['set-cookie'];
            });

            after(async () => {
                await db.Users.destroy({ where: {} });
            });

            it("expect return 401 error when attempting to update a service without authentication", async () => {
                const response = await request(app)
                    .put(`/api/services/1`)
                    .send({ name: "Updated Service Name", price: 20.20 })
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect return 404 error when a service not found", async () => {
                const response = await request(app)
                    .put("/api/services/1")
                    .send({ name: "Updated Service Name", price: 20.20 })
                    .set('Cookie', sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Service not found");
            });
        });
        describe("DELETE /api/services/:id", () => {
            before(async () => {
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

                sessionCookies = res.headers['set-cookie'];
            });
            after(async () => {
                await db.Users.destroy({ where: {} });
            });
            it("expect return 401 error when attempting to update a service without authentication", async () => {
                const response = await request(app)
                    .delete(`/api/services/1`)
                    .send({ name: "Updated Service Name", price: 20.20 })
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect return 404 error when a service not found", async () => {
                const response = await request(app)
                    .delete(`/api/services/1`)
                    .set('Cookie', sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Service not found");
            });
        });
    })
});