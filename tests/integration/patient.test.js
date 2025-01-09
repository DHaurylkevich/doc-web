process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("PatientController API", () => {
    let fakeUser, createdUser, patient, fakeAddress;

    beforeEach(async () => {
        fakeUser = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
            role: "patient",
            birthday: faker.date.past(30)
        };
        fakeAddress = { city: faker.location.city(), street: faker.location.street(), home: faker.location.buildingNumber(), flat: faker.location.buildingNumber(), post_index: faker.location.zipCode(), province: faker.location.state() };

        createdUser = await db.Users.create(fakeUser);
        patient = await createdUser.createPatient();
        await createdUser.createAddress(fakeAddress);
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
    afterEach(async () => {
        await db.Patients.destroy({ where: {} });
        await db.Users.destroy({ where: {} });
        await db.Addresses.destroy({ where: {} });
        await db.DoctorService.destroy({ where: {} });
        await db.Services.destroy({ where: {} });
        await db.Doctors.destroy({ where: {} });
    });

    describe("Positive tests", () => {
        describe("GET /api/patients", () => {
            let doctor, clinic, appointment, doctorService;

            beforeEach(async () => {
                const fakeUser2 = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    phone: faker.phone.number({ style: 'international' }),
                    pesel: 12345678981,
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient",
                    birthday: faker.date.past(30)
                };
                const fakeAddress2 = { city: faker.location.city(), street: faker.location.street(), home: faker.location.buildingNumber(), flat: faker.location.buildingNumber(), post_index: faker.location.zipCode(), province: faker.location.state() };

                const createdUser2 = await db.Users.create(fakeUser2);
                patient = await createdUser2.createPatient();
                await createdUser2.createAddress(fakeAddress2);
                userId = createdUser2.id;

                doctor = await db.Doctors.create({
                    description: faker.lorem.sentence()
                });
                clinic = await db.Clinics.create({
                    name: faker.company.name(),
                    password: faker.internet.password(),
                    nip: faker.number.int({ min: 1000000000, max: 9999999999 }),
                    nr_license: faker.vehicle.vin(),
                    email: faker.internet.email(),
                    phone: faker.phone.number({ style: 'international' }),
                });

                service = await db.Services.create({
                    name: 'Test Service',
                    description: 'Test Service Description',
                    price: 100
                });

                doctorService = await db.DoctorService.create({
                    doctor_id: doctor.id,
                    service_id: service.id
                });

                appointment = await db.Appointments.create({
                    time_slot: "10:00",
                    patient_id: patient.id,
                    doctor_service_id: doctorService.id,
                    clinic_id: clinic.id,
                    appointment_date: new Date()
                });
            });
            afterEach(async () => {
                await db.Appointments.destroy({ where: {} });
                await db.Clinics.destroy({ where: {} });
            });

            it("should return patients filtered by doctorId", async () => {
                await db.Appointments.create({
                    time_slot: "10:00",
                    patient_id: patient.id,
                    doctor_service_id: doctorService.id,
                    clinic_id: clinic.id,
                    appointment_date: new Date()
                });

                const response = await request(app)
                    .get("/api/patients")
                    .query({
                        sort: 'asc',
                        limit: 10,
                        pages: 0,
                        doctorId: doctor.id
                    })
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.be.an('array');
                expect(response.body).to.have.lengthOf(2);
                expect(response.body[0].patient.user.id).to.equal(userId);
            });
            it("should return patients filtered by clinicId", async () => {
                const doctor2 = await db.Doctors.create({
                    description: faker.lorem.sentence()
                });
                const doctorService2 = await db.DoctorService.create({
                    doctor_id: doctor2.id,
                    service_id: service.id
                });
                await db.Appointments.create({
                    time_slot: "10:00",
                    patient_id: patient.id,
                    doctor_service_id: doctorService2.id,
                    clinic_id: clinic.id,
                    appointment_date: new Date()
                });

                const response = await request(app)
                    .get("/api/patients")
                    .query({
                        sort: 'asc',
                        limit: 10,
                        pages: 0,
                        clinicId: clinic.id
                    })
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.be.an('array');
                expect(response.body).to.have.lengthOf(2);
                expect(response.body[0].patient.user.id).to.equal(userId);
            });
            it("should return patients sorted in descending order", async () => {
                fakeUser.first_name = "ZZZ";
                fakeUser.email = "test@gmail.com";
                const anotherUser = await db.Users.create(fakeUser);
                const anotherPatient = await anotherUser.createPatient();
                await db.Appointments.create({
                    time_slot: "11:00",
                    patient_id: anotherPatient.id,
                    doctor_service_id: appointment.doctor_service_id,
                    clinic_id: clinic.id,
                    appointment_date: new Date()
                });

                const response = await request(app)
                    .get("/api/patients")
                    .query({
                        sort: 'desc',
                        limit: 10,
                        pages: 0,
                        clinicId: clinic.id
                    })
                    .set('Cookie', sessionCookies)
                    .expect(200);
                console.log(response.body);
                expect(response.body).to.be.an('array');
                expect(response.body).to.have.lengthOf(2);
                expect(response.body[1].patient.user.first_name).to.equal('ZZZ');
            });
        });
        describe("GET /api/patients/:userId", () => {
            it("expect user by id, when it exists", async () => {
                const response = await request(app)
                    .get(`/api/patients/${userId}`)
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body.user).to.have.property("id", userId);
                expect(response.body.user).to.have.property("first_name", fakeUser.first_name);
            });
        });
        describe("PUT /api/patients/:id", () => {
            it("expect to update patient, when data valid and it exists", async () => {
                const userData = { first_name: "Scarlett" };
                const addressData = { city: "East Mavisville" };

                const response = await request(app)
                    .put(`/api/users/${userId}/patients`)
                    .set('Content-Type', 'application/json')
                    .send({ userData, addressData })
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body.user.first_name).to.deep.equals(userData.first_name);
                expect(response.body.address.city).to.deep.equals(addressData.city);
            });
        });
    });
    describe("Negative tests", () => {
        describe("GET /api/patients", () => {
            it("expect return 401 'Unauthorized user' when authentication is missing", async () => {
                const response = await request(app)
                    .get("/api/patients")
                    .expect(401);

                expect(response.body).to.have.property('message', 'Unauthorized user');
            });
        });
        describe("GET /api/patient/:userId", () => {
            it("expect return 401 'Unauthorized user'when authentication is missing", async () => {
                const response = await request(app)
                    .get("/api/patients/1")
                    .expect(401);

                expect(response.body).to.have.property('message', 'Unauthorized user');
            });
        });
        describe("PUT /api/patient/:id", () => {
            it("expect return 401 'Unauthorized user'when authentication is missing", async () => {
                const response = await request(app)
                    .get("/api/patients/1")
                    .expect(401);

                expect(response.body).to.have.property('message', 'Unauthorized user');
            });
        });
    });
});