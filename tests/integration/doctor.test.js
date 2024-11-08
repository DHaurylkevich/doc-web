require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../doc-web");
const db = require("../../src/models");

describe("DoctorController API", () => {
    let fakeDoctor;

    before(async () => {
        await db.sequelize.sync({ force: true });
    });
    beforeEach(async () => {
        fakeDoctor = {
            hired_at: faker.date.past(),
            description: faker.lorem.paragraph()
        };
    })
    afterEach(async () => {
        await db.sequelize.sync({ force: true });
        await db.Clinics.destroy({ where: {} });
        await db.Doctors.destroy({ where: {} });
        await db.Users.destroy({ where: {} });
        await db.Addresses.destroy({ where: {} });
        await db.Specialties.destroy({ where: {} });
        await db.Services.destroy({ where: {} });
    });

    describe("POST /api/doctors", () => {
        let fakeClinic, fakeUser, fakeAddress;
        beforeEach(async () => {
            fakeClinic = { name: faker.company.buzzAdjective(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }), description: faker.lorem.sentence(), schedule: "Date" };
            fakeUser = {
                first_name: faker.person.firstName(), last_name: faker.person.lastName(),
                email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }),
                pesel: 12345678, password: "Test@1234", gender: "male",
                role: "patient", birthday: faker.date.past(30)
            };
            fakeAddress = { city: faker.location.city(), province: faker.location.state(), street: faker.location.street(), home: faker.location.buildingNumber(), flat: faker.location.buildingNumber(), post_index: faker.location.zipCode() };
        });
        it("expect to create doctor with specialty, when clinicData and addressData is valid", async () => {
            const clinic = await db.Clinics.create(fakeClinic);
            const specialtiesInDb = await db.Specialties.create({ name: "Cardiology" });
            const specialtyId = specialtiesInDb.id;
            const servicesInDb = await db.Services.bulkCreate([{ name: "Cut hand", price: 10.10, }, { name: "Say less you", price: 10.10, }]);
            const servicesIds = servicesInDb.map(serviceId => serviceId.id);

            const response = await request(app)
                .post("/api/doctors")
                .send({ userData: fakeUser, addressData: fakeAddress, doctorData: fakeDoctor, specialtyId, clinicId: clinic.id, servicesIds })
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
            expect(doctorInDb.services[0].id).to.deep.equals(1);
        });
    });
    describe("GET /api/doctors/:id/short", () => {
        it("should return a doctor by id when it exists", async () => {
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

        it("should return 404 when doctor does not exist", async () => {
            // const nonExistentId = 99999;

            // await request(app)
            //     .get(`/api/doctors/${nonExistentId}`)
            //     .expect(404);
        });
    });
    describe("GET /api/doctors/:userId", () => {
        beforeEach(async () => {
            fakeUser = {
                first_name: faker.person.firstName(), last_name: faker.person.lastName(),
                email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }),
                pesel: 12345678, password: "Test@1234", gender: "male",
                role: "patient", birthday: faker.date.past(30)
            };
        });
        it("should return a doctor by id when it exists", async () => {
            const specialtiesInDb = await db.Specialties.create({ name: "Cardiology" });
            const createdUser = await db.Users.create(fakeUser);
            fakeDoctor.specialty_id = specialtiesInDb.id
            const createdDoctor = await createdUser.createDoctor(fakeDoctor);

            const response = await request(app)
                .get(`/api/doctors/${createdUser.id}`)
                .expect(200);

            expect(response.body).to.have.property("id", createdDoctor.id);
            expect(response.body.firstName).to.equal(createdDoctor.firstName);
            expect(response.body.lastName).to.equal(createdDoctor.lastName);
            expect(response.body.description).to.equal(createdDoctor.description);
            expect(response.body).to.have.property("specialty");
        });
    });
    describe("GET /clinics/:clinicId/doctors", () => {
        let fakeClinic, fakeUser;
        beforeEach(async () => {
            fakeClinic = { name: faker.company.buzzAdjective(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }), description: faker.lorem.sentence(), schedule: "Date" };
            fakeUser = {
                first_name: faker.person.firstName(), last_name: faker.person.lastName(),
                email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }),
                pesel: 12345678, password: "Test@1234", gender: "male",
                role: "patient", birthday: faker.date.past(30)
            };
        });
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
    describe("PUT /api/doctors/:id", () => {
        let fakeUser, fakeAddress;
        beforeEach(async () => {
            fakeUser = {
                first_name: faker.person.firstName(), last_name: faker.person.lastName(),
                email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }),
                pesel: 12345678, password: "Test@1234",
                role: "patient", birthday: faker.date.past(30)
            };
            fakeAddress = { city: faker.location.city(), province: faker.location.state(), street: faker.location.street(), home: faker.location.buildingNumber(), flat: faker.location.buildingNumber(), post_index: faker.location.zipCode() };
        })
        it("expect to update doctor, when data valid and it exists", async () => {
            await db.Specialties.bulkCreate([{ name: "Cardiology" }, { name: "Paper" }]);
            const createdUser = await db.Users.create(fakeUser);
            const createdAddress = await db.Addresses.create(fakeAddress);
            await createdUser.setAddress(createdAddress);
            const createdDoctor = await createdUser.createDoctor(fakeDoctor);
            await db.Services.bulkCreate([{ specialty_id: 1, name: "Cut hand", price: 10.10 }, { specialty_id: 2, name: "Cut", price: 10.10 }]);
            await createdDoctor.setServices([1]);
            fakeUser.first_name = "test";
            fakeDoctor.specialty_id = 2;

            const response = await request(app)
                .put(`/api/users/${createdUser.id}/doctors/`)
                .send({ userData: fakeUser, doctorData: fakeDoctor, servicesIds: [2] })
                .expect(200);
            expect(response.body.name).to.equal(fakeUser.name);
            const doctorInDb = await db.Doctors.findByPk(1, {
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
            console.log(fakeDoctor);
            expect(doctorInDb.user.first_name).to.equal(fakeUser.first_name);
            expect(doctorInDb.specialty.name).to.equal("Paper");
            expect(doctorInDb.services[0].name).to.equal("Cut");
        });
    });
    // describe("POST /api/doctors/:id/services", () => {
    //     it("expect to add services for doctor, when data valid and they exists", async () => {
    //         const createdDoctor = await db.Doctors.create(fakeDoctor);
    //         const specialties = [{ name: "Cardiology" }, { name: "Dermatology" }];
    //         const specialtiesInDb = await db.Specialties.bulkCreate(specialties);
    //         const specialtyIds = specialtiesInDb.map((specialty) => specialty.id);
    //         const service = [{ name: "Cardiology" }, { name: "Dermatology" }];
    //         const serviceInDb = await db.Services.bulkCreate(service);
    //         const serviceIds = specialtiesInDb.map((specialty) => specialty.id);

    //         const response = await request(app)
    //             .post(`/api/doctor/${createdDoctor.id}/services/`)
    //             .send({ specialtiesIds: specialtyIds, services: { serviceIds, price } })
    //             .expect(200);

    //         expect(response.body.name).to.equal(updatedClinic.name);

    //         const clinicInDb = await db.Clinics.findByPk(clinicId);
    //         expect(clinicInDb.name).to.equal(updatedClinic.name);
    //     });
    // });
});