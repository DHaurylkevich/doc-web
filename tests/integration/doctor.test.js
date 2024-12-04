process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("DoctorController API", () => {
    let fakeDoctor, fakeClinic, fakeUser;

    beforeEach(async () => {
        fakeDoctor = {
            hired_at: faker.date.past(),
            description: faker.lorem.paragraph()
        };
        fakeClinic = { name: faker.company.buzzAdjective(), password: faker.internet.password(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }), description: faker.lorem.sentence(), schedule: "Date" };
        fakeUser = {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            phone: faker.phone.number({ style: 'international' }),
            pesel: "12345678901", password: "Test@1234", gender: "male",
            role: "patient",
            birthday: faker.date.past(30)
        };
    })
    afterEach(async () => {
        await db.Clinics.destroy({ where: {} });
        await db.Doctors.destroy({ where: {} });
        await db.Users.destroy({ where: {} });
        await db.Addresses.destroy({ where: {} });
        await db.Specialties.destroy({ where: {} });
        await db.Services.destroy({ where: {} });
    });

    describe("Positive tests", () => {
        describe("POST /clinic/:clinicId/doctors", () => {
            let fakeUser, fakeAddress;
            beforeEach(async () => {
                fakeAddress = { city: faker.location.city(), province: faker.location.state(), street: faker.location.street(), home: faker.location.buildingNumber(), flat: faker.location.buildingNumber(), post_index: faker.location.zipCode() };
            });
            it("expect to create doctor with specialty, when clinicData and addressData is valid", async () => {
                const clinic = await db.Clinics.create(fakeClinic);
                const specialtiesInDb = await db.Specialties.create({ name: "Cardiology" });
                const specialtyId = specialtiesInDb.id;
                const servicesInDb = await db.Services.bulkCreate([{ name: "Cut hand", price: 10.10, }, { name: "Say less you", price: 10.10, }]);
                const servicesIds = servicesInDb.map(serviceId => serviceId.id);

                const response = await request(app)
                    .post(`/api/clinic/${clinic.id}/doctors/`)
                    .send({ userData: fakeUser, addressData: fakeAddress, doctorData: fakeDoctor, specialtyId, servicesIds })
                    .expect(201);

                expect(response.body).to.have.property("id");
                expect(response.body).to.have.property("clinic_id", clinic.id);
                const doctorInDb = await db.Doctors.findByPk(response.body.id, {
                    include: [
                        {
                            model: db.Specialties, as: 'specialty'
                        },
                        {
                            model: db.Services, as: 'services'
                        },
                        {
                            model: db.Users, as: 'user',
                            include: [
                                {
                                    model: db.Addresses, as: "address"
                                }
                            ]
                        }
                    ]
                });

                expect(doctorInDb).to.exist;
                expect(doctorInDb.specialty.id).to.equals(specialtyId);
                expect(doctorInDb.services[0].id).to.deep.equals(servicesIds[0]);
            });
        });
        describe("GET /api/doctors/:doctorId/short", () => {
            it("expect to return a doctor by id when it exists", async () => {
                const specialtiesInDb = await db.Specialties.create({ name: "Cardiology" });
                fakeDoctor.specialty_id = specialtiesInDb.id
                const createdDoctor = await db.Doctors.create(fakeDoctor);

                const response = await request(app)
                    .get(`/api/doctors/${createdDoctor.id}/short`)
                    .expect(200);

                expect(response.body).to.have.property("id", createdDoctor.id);
                expect(response.body.firstName).to.equal(createdDoctor.firstName);
                expect(response.body.lastName).to.equal(createdDoctor.lastName);
                expect(response.body.description).to.equal(createdDoctor.description);
                expect(response.body).to.have.property("specialty");
            });
        });
        describe("GET /api/doctors/:doctorId", () => {
            it("expect to return a doctor by id when it exists", async () => {
                const specialtiesInDb = await db.Specialties.create({ name: "Cardiology" });
                fakeDoctor.specialty_id = specialtiesInDb.id
                const createdDoctor = await db.Doctors.create(fakeDoctor);

                const response = await request(app)
                    .get(`/api/doctors/${createdDoctor.id}`)
                    .expect(200);

                expect(response.body).to.have.property("id", createdDoctor.id);
                expect(response.body.description).to.equal(createdDoctor.description);
                expect(response.body).to.have.property("user");
                expect(response.body).to.have.property("specialty");
            });
        });
        describe("PUT /api/users/:userId/doctors", () => {
            let fakeAddress;
            beforeEach(async () => {
                fakeAddress = { city: faker.location.city(), province: faker.location.state(), street: faker.location.street(), home: faker.location.buildingNumber(), flat: faker.location.buildingNumber(), post_index: faker.location.zipCode() };
            })
            it("expect to update doctor, when data valid and it exists", async () => {
                const specialties = await db.Specialties.bulkCreate([{ name: "Cardiology" }, { name: "Paper" }]);
                const createdUser = await db.Users.create(fakeUser);
                const createdAddress = await db.Addresses.create(fakeAddress);
                fakeDoctor.specialty_id = specialties[0].id;
                await createdUser.setAddress(createdAddress);
                const createdDoctor = await createdUser.createDoctor(fakeDoctor);
                const service = await db.Services.bulkCreate([{ specialty_id: specialties[0].id, name: "Cut hand", price: 10.10 }, { specialty_id: specialties[1].id, name: "Cut", price: 10.10 }]);
                await createdDoctor.setServices([service[1].id]);
                fakeUser.first_name = "test";
                fakeDoctor.specialty_id = specialties[1].id;

                const response = await request(app)
                    .put(`/api/users/${createdUser.id}/doctors/`)
                    .send({ userData: fakeUser, doctorData: fakeDoctor, servicesIds: [service[0].id, service[1].id] })
                    .expect(200);

                expect(response.body.name).to.equal(fakeUser.name);
                const doctorInDb = await db.Doctors.findByPk(response.body.id, {
                    include: [
                        {
                            model: db.Specialties, as: "specialty"
                        },
                        {
                            model: db.Services, as: "services"
                        },
                        {
                            model: db.Users, as: "user",
                            include: [
                                {
                                    model: db.Addresses, as: "address"
                                },
                            ]
                        }
                    ]
                });
                console.log(doctorInDb.services);
                expect(doctorInDb.user.first_name).to.equal(fakeUser.first_name);
                expect(doctorInDb.specialty.name).to.equal(specialties[1].name);
                expect(doctorInDb.services[0].name).to.equal("Cut");
                expect(doctorInDb.services[1].name).to.equal("Cut hand");
            });
        });
        describe("GET /clinics/:clinicId/doctors", () => {
            it("should return a doctor by id when it exists", async () => {
                const clinic = await db.Clinics.create(fakeClinic);
                const user = await db.Users.create(fakeUser);
                fakeDoctor.clinic_id = clinic.id;
                const createdDoctor = await user.createDoctor(fakeDoctor);

                const response = await request(app)
                    .get(`/api/clinics/${clinic.id}/doctors/?gender=male&order=asc`)
                    .expect(200);
                console.log(response.body);
                expect(response.body[0]).to.have.property("id", createdDoctor.id);
                expect(response.body[0].firstName).to.equal(createdDoctor.firstName);
                expect(response.body[0].lastName).to.equal(createdDoctor.lastName);
                expect(response.body[0].gender).to.equal(createdDoctor.gender);
            });
        });
    });
    describe("Negative tests", () => {
        describe("POST /clinic/:clinicId/doctors", () => {
            let fakeClinic, fakeUser, fakeAddress;
            beforeEach(async () => {
                fakeClinic = { name: faker.company.buzzAdjective(), password: faker.internet.password(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }), description: faker.lorem.sentence(), schedule: "Date" };
                fakeUser = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    phone: faker.phone.number({ style: 'international' }),
                    pesel: "12345678901", password: "Test@1234", gender: "male",
                    role: "patient",
                    birthday: faker.date.past(30)
                };
                fakeAddress = { city: faker.location.city(), province: faker.location.state(), street: faker.location.street(), home: faker.location.buildingNumber(), flat: faker.location.buildingNumber(), post_index: faker.location.zipCode() };
            });
            it("expect AppError('User already exist'), when user exists", async () => {
                const clinic = await db.Clinics.create(fakeClinic);
                const specialtiesInDb = await db.Specialties.create({ name: "Cardiology" });
                const createdUser = await db.Users.create(fakeUser);
                fakeDoctor.specialty_id = specialtiesInDb.id;
                await createdUser.createDoctor(fakeDoctor);

                const response = await request(app)
                    .post(`/api/clinic/${clinic.id}/doctors/`)
                    .send({ userData: fakeUser, addressData: fakeAddress, doctorData: fakeDoctor, specialtyId: specialtiesInDb.id, servicesIds: [1] })
                    .expect(400);

                expect(response.body).to.have.property("message", "User already exist");
            });
        });
        describe("GET /api/doctors/:id/short", () => {
            it("expect AppError('Doctor not found'), when it doesn't exist", async () => {
                const response = await request(app)
                    .get("/api/doctors/1/short")
                    .expect(404);

                expect(response.body).to.have.property("message", "Doctor not found");
            });
        });
        describe("GET /api/doctors/:doctorId", () => {
            it("expect AppError('Doctor not found'), when it doesn't exist", async () => {
                const response = await request(app)
                    .get("/api/doctors/1")
                    .expect(404);

                expect(response.body).to.have.property("message", "Doctor not found");
            });
        });
    });
});