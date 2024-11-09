// require("dotenv").config();
// process.env.NODE_ENV = 'test';

// const { expect } = require("chai");
// const request = require("supertest");
// const { faker } = require('@faker-js/faker');
// const app = require("../../index");
// const db = require("../../src/models");

// describe("DoctorController API", () => {
//     let fakeDoctor;

//     before(async () => {
//         await db.sequelize.sync({ force: true });
//     });

//     beforeEach(() => {
//         fakeDoctor = {
//             rating: faker.number.float({ min: 1, max: 5 }),
//             hired_at: faker.date.past(),
//             description: faker.lorem.paragraph()
//         };
//     });

//     afterEach(async () => {
//         await db.Doctors.destroy({ where: {} });
//     });

//     describe("POST /api/doctors", () => {
//         let fakeClinic, fakeUser;

//         beforeEach(async () => {
//             fakeClinic = { name: faker.company.name(), nip: faker.number.int({ min: 1000000000, max: 9999999999 }), email: faker.internet.email() };
//             fakeUser = {
//                 first_name: faker.person.firstName(), last_name: faker.person.lastName(),
//                 email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }),
//                 password: "Test@1234", role: "patient"
//             };
//             await db.Clinics.create(fakeClinic);
//             await db.Users.create(fakeUser);
//         });

//         it("expect to create doctor when data is valid", async () => {
//             const response = await request(app)
//                 .post("/api/doctors")
//                 .send({ doctorData: fakeDoctor, clinicId: 1 })
//                 .expect(201);

//             expect(response.body).to.have.property("id");
//             expect(response.body).to.have.property("description", fakeDoctor.description);
//         });
//     });
// });
