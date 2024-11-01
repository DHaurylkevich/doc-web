require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../doc-web");
const db = require("../../src/models");

describe("DoctorController API", () => {
    let clinicId, fakeDoctor;

    before(async () => {
        await db.sequelize.sync({ force: true });
    });
    beforeEach(async () => {
        fakeDoctor = {
            rating: faker.number.float({ min: 1, max: 5 }),
            hired_at: faker.date.past(),
            description: faker.lorem.paragraph()
        };
    })
    afterEach(async () => {
        await db.sequelize.sync({ force: true });
        await db.Clinics.destroy({ where: {} });
        await db.Doctors.destroy({ where: {} });
        await db.Users.destroy({ where: {} });
        await db.Specialties.destroy({ where: {} });
        await db.Services.destroy({ where: {} });
    });

    describe("POST /api/doctor", () => {
        let fakeClinic, fakeUser, doctorData;
        beforeEach(async () => {
            fakeClinic = { name: faker.company.buzzAdjective(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }), description: faker.lorem.sentence(), schedule: "Date" };
            fakeUser = {
                first_name: faker.person.firstName(), last_name: faker.person.lastName(),
                email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }),
                pesel: 12345678, password: "Test@1234",
                role: "patient", birthday: faker.date.past(30)
            };
        });
        it("expect to create doctor with specialty, when clinicData and addressData is valid", async () => {
            const clinic = await db.Clinics.create(fakeClinic);
            const specialtiesInDb = await db.Specialties.create({ name: "Cardiology" });
            const specialtyId = specialtiesInDb.id;
            const servicesInDb = await db.Services.bulkCreate([{ name: "Cut hand", price: 10.10, }, { name: "Say less you", price: 10.10, }]);
            const servicesIds = servicesInDb.map(serviceId => serviceId.id);

            const response = await request(app)
                .post("/api/doctor")
                .send({ userData: fakeUser, doctorData: fakeDoctor, specialtyId, clinicId: clinic.id, servicesIds })
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
                    }]
            });
            expect(doctorInDb).to.exist;
            expect(doctorInDb.specialty.id).to.equals(specialtyId);
            expect(doctorInDb.services[0].id).to.deep.equals(1);
        });
    });
    describe("GET /api/doctor/:id", () => {
        it("should return a doctor by id when it exists", async () => {
            const specialtiesInDb = await db.Specialties.create({ name: "Cardiology" });
            const doctorData = {
                rating: faker.number.float({ min: 1, max: 5 }),
                hired_at: faker.date.past(),
                description: faker.lorem.paragraph(),
                specialty_id: specialtiesInDb.id
            };
            const createdDoctor = await db.Doctors.create(doctorData);

            const response = await request(app)
                .get(`/api/doctor/${createdDoctor.id}`)
                .expect(200);

            expect(response.body).to.have.property("id", createdDoctor.id);
            expect(response.body.firstName).to.equal(doctorData.firstName);
            expect(response.body.lastName).to.equal(doctorData.lastName);
            expect(response.body.description).to.equal(doctorData.description);
            expect(response.body).to.have.property("specialty");
        });

        it("should return 404 when doctor does not exist", async () => {
            const nonExistentId = 99999;

            await request(app)
                .get(`/api/doctor/${nonExistentId}`)
                .expect(404);
        });
    });
    describe("PUT /api/doctor/:id", () => {
        let fakeUser, fakeDoctor;
        beforeEach(async () => {
            fakeUser = {
                first_name: faker.person.firstName(), last_name: faker.person.lastName(),
                email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }),
                pesel: 12345678, password: "Test@1234",
                role: "patient", birthday: faker.date.past(30)
            };
            fakeDoctor = {
                rating: faker.number.float({ min: 1, max: 5 }),
                hired_at: faker.date.past(),
                description: faker.lorem.paragraph(),
                specialty_id: 1
            };
        })
        it("expect to update doctor, when data valid and it exists", async () => {
            await db.Specialties.bulkCreate([{ name: "Cardiology" }, { name: "Paper" }]);
            const createdUser = await db.Users.create(fakeUser);
            const createdDoctor = await createdUser.createDoctor(fakeDoctor);
            await db.Services.bulkCreate([{ specialty_id: 1, name: "Cut hand", price: 10.10 }, { specialty_id: 2, name: "Cut", price: 10.10 }]);
            await createdDoctor.setServices([1]);
            fakeUser.first_name = "test";
            fakeDoctor.specialty_id = 2;

            const response = await request(app)
                .put(`/api/doctor/${createdDoctor.id}`)
                .send({ userData: fakeUser, doctorData: fakeDoctor, servicesIds: [2] })
                .expect(200);

            expect(response.body.name).to.equal(fakeUser.name);
            const doctorInDb = await db.Doctors.findByPk(1, {
                include: [
                    {
                        model: db.Specialties, as: 'specialty'
                    },
                    {
                        model: db.Services, as: 'services'
                    }]
            });
            expect(doctorInDb.first_name).to.equal(fakeUser.name);
            expect(doctorInDb.specialty.name).to.equal("Paper");
            expect(doctorInDb.services[0].name).to.equal("Cut");
        });
    });
    // describe("POST /api/doctor/:id/services", () => {
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