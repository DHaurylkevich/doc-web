process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("ReviewController API", () => {
    let testPatient, testDoctor, testTag;

    before(async () => {
        await db.sequelize.sync({ force: true });
    });

    const createTestDoctor = async () => {
        return await db.Doctors.create({
            rating: faker.number.float({ min: 1, max: 5 }),
            hired_at: faker.date.past(),
            description: faker.lorem.paragraph(),
        });
    };

    beforeEach(async () => {
        testPatient = await db.Patients.create({ gender: "male", market_inf: false });
        testDoctor = await createTestDoctor();
        testTag = await db.Tags.create({ name: faker.lorem.paragraph(), positive: true });
    });
    afterEach(async () => {
        await db.Reviews.destroy({ where: {} });
        await db.Tags.destroy({ where: {} });
        await db.Doctors.destroy({ where: {} });
        await db.Patients.destroy({ where: {} });
    });

    describe("POST /api/reviews", () => {
        it("expect to create review, when data is valid", async () => {
            const reviewData = {
                patientId: testPatient.id,
                doctorId: testDoctor.id,
                rating: faker.number.int({ min: 1, max: 5 }),
                comment: faker.lorem.paragraph(),
                tagsIds: [testTag.id],
            };
            const response = await request(app)
            .post("/api/reviews")
            .send(reviewData)
            .expect(201);
            
            expect(response.body).that.is.a("object");
            expect(response.body).to.include({ patient_id: reviewData.patientId });
            expect(response.body).to.include({ doctor_id: reviewData.doctorId });
            expect(response.body).to.include({ rating: reviewData.rating });
            expect(response.body).to.include({ comment: reviewData.comment });
        });
    });
    // describe("GET /api/appointments/", () => {
    //     let testAddress;
    //     beforeEach(async () => {
    //         testAppointment = await db.Appointments.create({
    //             clinic_id: testClinic.id,
    //             schedule_id: testSchedule.id,
    //             patient_id: testPatient.id,
    //             doctor_service_id: testDoctorService.id,
    //             timeSlot: "09:30",
    //             description: "Help me, pls",
    //             first_visit: true,
    //             visit_type: "NFZ",
    //             status: "active"
    //         });
    //         testAddress = await db.Addresses.create({ city: faker.location.city(), street: faker.location.street(), home: faker.location.buildingNumber(), flat: faker.location.buildingNumber(), post_index: faker.location.zipCode() });
    //         await testClinic.setAddress(testAddress.id);
    //     });
    //     it("expect services, when they exists", async () => {
    //         const response = await request(app)
    //             .get(`/api/appointments?city=${testAddress.city}&specialty=${testSpecialty.name}&date=${testSchedule.date}`)
    //             .expect(200);

    //         expect(response.body).to.be.an("array").that.is.not.empty;
    //         expect(response.body[0]).to.include.keys("doctor_id", "description", "rating", "specialty", "address", "date");
    //         expect(response.body[0].slots).to.not.include(testAppointment.timeSlot);
    //     });
    // });
    describe("GET /api/doctors/:doctorId/reviews", () => {
        it("expect reviews by doctorId, when they exists", async () => {
            const testReview = await db.Reviews.create({
                patient_id: testPatient.id,
                doctor_id: testDoctor.id,
                rating: faker.number.int({ min: 1, max: 5 }),
                comment: faker.lorem.paragraph(),
                tagsIds: [testTag.id],
            });

            const response = await request(app)
                .get(`/api/doctors/${testDoctor.id}/reviews`)
                .expect(200);

            expect(response.body).to.be.an("array").that.is.not.empty;
            expect(response.body[0]).to.include({ doctor_id: testReview.doctor_id });
        });
    });
    describe("GET /api/clinics/:clinicId/reviews", () => {
        it("expect reviews by clinicId, when they exists", async () => {
            const testClinic = await db.Clinics.create({ name: faker.company.buzzAdjective(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }), description: faker.lorem.sentence(), schedule: "Date" });
            await testClinic.addDoctor(testDoctor);
            await db.Reviews.create({
                patient_id: testPatient.id,
                doctor_id: testDoctor.id,
                rating: faker.number.int({ min: 1, max: 5 }),
                comment: faker.lorem.paragraph(),
                tagsIds: [testTag.id],
            });

            const response = await request(app)
                .get(`/api/clinics/${testClinic.id}/reviews`)
                .expect(200);
                
            expect(response.body).to.be.an("array").that.is.not.empty;
            expect(response.body[0].doctor).to.include({ clinic_id: testClinic.id });
        });
    });
    describe("DELETE /api/reviews/:id", () => {
        it("expect delete review by id, when it exists", async () => {
            const testReview = await db.Reviews.create({
                patient_id: testPatient.id,
                doctor_id: testDoctor.id,
                rating: faker.number.int({ min: 1, max: 5 }),
                comment: faker.lorem.paragraph(),
                tagsIds: [testTag.id],
            });

            await request(app)
                .delete(`/api/reviews/${testReview.id}`)
                .expect(200);

            const reviewInDb = await db.Reviews.findByPk(testReview.id);
            expect(reviewInDb).to.be.null;
        });
    });
});