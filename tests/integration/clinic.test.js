require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../doc-web");
const db = require("../../src/models");

describe("ClinicController API", () => {
    let clinicId;

    before(async () => {
        await db.sequelize.sync({ force: true });
    });

    afterEach(async () => {
        await db.Clinics.destroy({ where: {} });
    });

    describe("POST /api/clinics", () => {
        it("expect to create clinic with address, when clinicData and addressData is valid", async () => {
            const clinicData = { name: faker.company.buzzAdjective(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number(), description: faker.lorem.sentence(), schedule: "Date" };
            const addressData = { city: faker.location.city(), street: faker.location.street(), home: faker.location.buildingNumber(), flat: faker.location.buildingNumber(), post_index: faker.location.zipCode() };

            const response = await request(app)
                .post("/api/clinic")
                .send({ clinicData, addressData })
                .expect(201);

            expect(response.body).to.have.property("id");
            expect(response.body.name).to.equal(clinicData.name);
            clinicId = response.body.id;

            const clinicInDb = await db.Clinics.findByPk(clinicId);
            expect(clinicInDb).to.exist;
            expect(clinicInDb.name).to.equal(clinicData.name);
        });
    });
    describe("GET /api/clinics/:id", () => {
        it("expect clinic by id, when it exists", async () => {
            const clinicData = { name: faker.company.buzzAdjective(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number(), description: faker.lorem.sentence(), schedule: "Date" };
            const createdClinic = await db.Clinics.create(clinicData);
            clinicId = createdClinic.id;

            const response = await request(app)
                .get(`/api/clinic/${clinicId}`)
                .expect(200);

            expect(response.body).to.have.property("id", clinicId);
            expect(response.body.name).to.equal(clinicData.name);
        });
    });
    describe("PUT /api/clinics/:id", () => {
        it("expect to update clinic, when data valid and it exists", async () => {
            const clinicData = { name: faker.company.buzzAdjective(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number(), description: faker.lorem.sentence(), schedule: "Date" };
            const addressData = { city: faker.location.city(), street: faker.location.street(), home: faker.location.buildingNumber(), flat: faker.location.buildingNumber(), post_index: faker.location.zipCode() };
            const updatedClinic = { name: faker.company.buzzAdjective(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number(), description: faker.lorem.sentence(), schedule: "Date" };
            const updatedAddress = { city: faker.location.city(), street: faker.location.street(), home: faker.location.buildingNumber(), flat: faker.location.buildingNumber(), post_index: faker.location.zipCode() };

            const createdClinic = await db.Clinics.create(clinicData);
            await createdClinic.createAddress(addressData);
            clinicId = createdClinic.id;

            const response = await request(app)
                .put(`/api/clinic/${clinicId}`)
                .send({ clinicData: updatedClinic, addressData: updatedAddress })
                .expect(200);

            expect(response.body.name).to.equal(updatedClinic.name);

            const clinicInDb = await db.Clinics.findByPk(clinicId);
            expect(clinicInDb.name).to.equal(updatedClinic.name);
        });
    });
    describe("DELETE /api/clinics/:id", () => {
        it("expect delete clinic by id, when it exists", async () => {
            const clinicData = { name: faker.company.buzzAdjective(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number(), description: faker.lorem.sentence(), schedule: "Date" };

            const createdClinic = await db.Clinics.create(clinicData);
            clinicId = createdClinic.id;

            await request(app)
                .delete(`/api/clinic/${clinicId}`)
                .expect(200);

            const clinicInDb = await db.Clinics.findByPk(clinicId);
            expect(clinicInDb).to.be.null;
        });
    });
});