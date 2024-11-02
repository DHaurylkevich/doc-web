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
        await db.Clinics.destroy({ where: {} });
        await db.Specialties.destroy({ where: {} });
        await db.Services.destroy({ where: {} });
    });

    describe("POST /api/specialty", () => {
        it("expect to create specialty, when data is valid", async () => {
            const response = await request(app)
                .post("/api/specialties")
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
                .get("/api/specialties/")
                .expect(200);

            expect(response.body[0]).to.have.property("id", specialtyId);
            expect(response.body[0].name).to.equal(fakeSpecialty.name);
        });
    });
    describe("GET /api/clinic/:id/specialties", () => {
        let fakeClinic;
        beforeEach(async () => {
            fakeClinic = { name: faker.company.buzzAdjective(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }), description: faker.lorem.sentence(), schedule: "Date" };
        });
        it("expect specialties, when they exist", async () => {
            const createdClinic = await db.Clinics.create(fakeClinic);
            const specialtiesInDb = await db.Specialties.create({ name: "Cardiology" });
            const specialtyId = specialtiesInDb.id;
            const servicesInDb = await db.Services.bulkCreate([{ clinic_id: 1, specialty_id: 1, name: "Cut hand", price: 10.10, }, { clinic_id: 1, specialty_id: 1, name: "Say less you", price: 10.10, }]);

            const response = await request(app)
                .get(`/api/clinic/${createdClinic.id}/specialties`)
                .expect(200);
            console.log(response.body);
            expect(response.body[0]).to.have.property("id", specialtyId);
            expect(response.body[0].name).to.equal(specialtiesInDb.name);
            expect(response.body[0].services[0].name).to.deep.equal(servicesInDb[0].name);
        });
    });
    describe("GET /api/specialties/:id", () => {
        let specialtyId;
        beforeEach(async () => {
            const createdSpecialty = await db.Specialties.create(fakeSpecialty);
            specialtyId = createdSpecialty.id;
        });
        it("expect specialty by id, when it exists", async () => {
            const response = await request(app)
                .get(`/api/specialties/${specialtyId}`)
                .expect(200);

            expect(response.body).to.have.property("id", specialtyId);
            expect(response.body.name).to.equal(fakeSpecialty.name);
        });
    });
    describe("PUT /api/specialties/:id", () => {
        let specialtyId;
        beforeEach(async () => {
            const createdSpecialty = await db.Specialties.create(fakeSpecialty);
            specialtyId = createdSpecialty.id;
        });
        it("expect to update specialty, when data valid and it exists", async () => {
            await request(app)
                .put(`/api/specialties/${specialtyId}`)
                .send({ specialtyData: { name: "TEST" } })
                .expect(200);

            const specialtyInDB = await db.Specialties.findByPk(specialtyId);
            expect(specialtyInDB.name).to.equals("TEST")
        });
    });
    describe("DELETE /api/specialties/:id", () => {
        let specialtyId;
        beforeEach(async () => {
            const createdSpecialty = await db.Specialties.create(fakeSpecialty);
            specialtyId = createdSpecialty.id;
        });
        it("expect delete service by id, when it exists", async () => {
            await request(app)
                .delete(`/api/specialties/${specialtyId}`)
                .expect(200);

            const specialtyInDb = await db.Specialties.findByPk(specialtyId);
            expect(specialtyInDb).to.be.null;
        });
    });
});