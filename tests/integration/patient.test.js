process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("PatientController API", () => {
    let token, fakeUser, fakePatient, fakeAddress;

    before(async () => {
        await db.sequelize.sync({ force: true });
    });
    beforeEach(async () => {
        fakeUser = {
            first_name: faker.person.firstName(), last_name: faker.person.lastName(),
            email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }),
            pesel: 12345678, password: "Test@1234",
            role: "patient", birthday: faker.date.past(30)
        };
        fakePatient = { gender: "male", market_inf: false, };
        fakeAddress = { city: faker.location.city(), street: faker.location.street(), home: faker.location.buildingNumber(), flat: faker.location.buildingNumber(), post_index: faker.location.zipCode(), province: faker.location.state() };

        // token = authMiddleware.createJWT(userId, fakeUser.role);
    });
    afterEach(async () => {
        await db.Users.destroy({ where: {} });
    });

    describe("POST /api/patient", () => {
        it("expect to create patient and to return token, when data is valid", async () => {
            const response = await request(app)
                .post("/api/patients/")
                .send({ userData: fakeUser, patientData: fakePatient, addressData: fakeAddress })
                .expect(201);

            expect(response.body).that.is.a("string");
        });
    });
    describe("GET /api/patient/:userId", () => {
        let userId;
        beforeEach(async () => {
            const createdUser = await db.Users.create(fakeUser);
            const createdPatient = await createdUser.createPatient(fakePatient);
            await createdPatient.createAddress(fakeAddress);
            userId = createdUser.id;
        });
        it("expect user by id, when it exists", async () => {
            const response = await request(app)
                .get(`/api/patients/${userId}`)
                .send({ role: fakeUser.role })
                .expect(200);
            console.log(response.body);
            expect(response.body).to.have.property("id", userId);
            expect(response.body.User).to.have.property("first_name", fakeUser.first_name);
        });
    });
    describe("PUT /api/patient/:id", () => {
        let userId;
        beforeEach(async () => {
            const createdUser = await db.Users.create(fakeUser);
            const createdPatient = await createdUser.createPatient(fakePatient);
            await createdPatient.createAddress(fakeAddress);
            userId = createdUser.id;
        });
        it("expect to update patient, when data valid and it exists", async () => {
            const updateUser = { first_name: faker.person.firstName() }
            const updatePatient = { market_inf: true };
            const updateAddress = { city: faker.location.city() }

            const response = await request(app)
                .put(`/api/patients/${userId}`)
                .send({ userData: updateUser, patientData: updatePatient, addressData: updateAddress })
                .expect(200);

            expect(response.body.user.first_name).to.deep.equals(updateUser.first_name);
            expect(response.body.patient.gender).to.deep.equals(updatePatient.gender);
            expect(response.body.address.city).to.deep.equals(updateAddress.city);
        });
    });
});