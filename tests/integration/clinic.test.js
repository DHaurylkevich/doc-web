process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");
const mail = require("../../src/utils/mail");
const sinon = require("sinon");

describe("ClinicController API", () => {
    let clinicId, clinicData, addressData;

    beforeEach(async () => {
        clinicData = {
            name: faker.company.buzzAdjective(),
            nip: 1234567890,
            registration_day: faker.date.birthdate(),
            nr_license: faker.vehicle.vin(),
            // email: faker.internet.email(), 
            email: "dhaurylkevich@gmail.com",
            phone: faker.phone.number({ style: 'international' }),
            password: faker.internet.password(),
            province: faker.location.state(),
            description: faker.lorem.sentence(),
            schedule: "Pn-Pt 10:00-18:00"
        };
        addressData = {
            city: faker.location.city(),
            province: faker.location.state(),
            street: faker.location.street(),
            home: faker.location.buildingNumber(),
            flat: faker.location.buildingNumber(),
            post_index: faker.location.zipCode()
        };
    });
    afterEach(async () => {
        await db.Clinics.destroy({ where: {} });
        await db.Addresses.destroy({ where: {} });
    });

    describe("POST /api/clinics", () => {
        beforeEach(async () => {
            mail.setPasswordMail = sinon.stub();
        });
        afterEach(async () => {
            sinon.restore();
        });
        it("expect to create clinic with address, when clinicData and addressData is valid", async () => {
            const response = await request(app)
                .post("/api/clinics")
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
            const createdClinic = await db.Clinics.create(clinicData);
            await createdClinic.createAddress(addressData);
            clinicId = createdClinic.id;

            const response = await request(app)
                .get(`/api/clinics/${clinicId}`)
                .expect(200);

            expect(response.body).to.have.property("id", clinicId);
            expect(response.body.name).to.equal(clinicData.name);
        });
    });
    describe("GET /api/clinics", () => {
        it("expect clinic by id, when it exists", async () => {
            const createdClinic = await db.Clinics.create(clinicData);
            clinicId = createdClinic.id;

            const response = await request(app)
                .get(`/api/clinics`)
                .expect(200);

            expect(response.body).to.be.an('array');
            expect(response.body).to.have.length.greaterThan(0);
            const clinic = response.body.find(c => c.id === clinicId);
            expect(clinic).to.exist;
            expect(clinic).to.have.property("id", clinicId);
            expect(clinic).to.have.property("name", clinicData.name);
        });
    });
    describe("PUT /api/clinics/:id", () => {
        it("expect to update clinic, when data valid and it exists", async () => {
            const updatedClinic = { name: faker.company.buzzAdjective(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number(), description: faker.lorem.sentence(), schedule: "Date" };
            const updatedAddress = { city: faker.location.city(), street: faker.location.street(), home: faker.location.buildingNumber(), flat: faker.location.buildingNumber(), post_index: faker.location.zipCode() };

            const createdClinic = await db.Clinics.create(clinicData);
            await createdClinic.createAddress(addressData);
            clinicId = createdClinic.id;

            const response = await request(app)
                .put(`/api/clinics/${clinicId}`)
                .send({ clinicData: updatedClinic, addressData: updatedAddress })
                .expect(200);

            expect(response.body.name).to.equal(updatedClinic.name);
            const clinicInDb = await db.Clinics.findByPk(clinicId);
            expect(clinicInDb.name).to.equal(updatedClinic.name);
        });
    });
    describe("DELETE /api/clinics/:id", () => {
        it("expect delete clinic by id, when it exists", async () => {
            const createdClinic = await db.Clinics.create(clinicData);
            clinicId = createdClinic.id;

            await request(app)
                .delete(`/api/clinics/${clinicId}`)
                .expect(200);

            const clinicInDb = await db.Clinics.findByPk(clinicId);
            expect(clinicInDb).to.be.null;
        });
    });
});