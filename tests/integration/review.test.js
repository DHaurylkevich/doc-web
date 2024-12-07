process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("ReviewController API", () => {
    let testPatient, testDoctor, testTag;

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
        await db.Users.destroy({ where: {} });
        await db.ReviewTags.destroy({ where: {} });
        await db.Reviews.destroy({ where: {} });
        await db.Tags.destroy({ where: {} });
        await db.Clinics.destroy({ where: {} });
        await db.Doctors.destroy({ where: {} });
        await db.Patients.destroy({ where: {} });
    });

    describe("Positive tests", () => {
        describe("POST /api/reviews", () => {
            let sessionCookies, patientId;
            beforeEach(async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient",
                };
                const createdUser = await db.Users.create(fakeUser);
                const createdPatient = await testPatient.update({ user_id: createdUser.id });

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];
                patientId = createdPatient.id;
            });
            it("expect to create review and to set a rating for the doctor, when data is valid", async () => {
                const existingReviews = [
                    { patient_id: patientId, doctor_id: testDoctor.id, rating: 4, comment: "Good doctor" },
                    { patient_id: patientId, doctor_id: testDoctor.id, rating: 5, comment: "Excellent service" },
                    { patient_id: patientId, doctor_id: testDoctor.id, rating: 3, comment: "Average experience" }
                ];
                await db.Reviews.bulkCreate(existingReviews);
                const newReviewData = { doctorId: testDoctor.id, rating: faker.number.int({ min: 1, max: 5 }), comment: faker.lorem.paragraph(), tagsIds: [testTag.id] };
                const allRatings = [...existingReviews.map(r => r.rating), newReviewData.rating];
                const expectedAverageRating = (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1);

                const response = await request(app)
                    .post("/api/reviews")
                    .send(newReviewData)
                    .set('Cookie', sessionCookies)
                    .expect(201);

                expect(response.body).to.be.an("object");
                expect(response.body).to.have.property("averageRating");
                expect(response.body).to.have.property("totalReviews");
                expect(response.body.averageRating).to.equal(expectedAverageRating);
                expect(response.body.totalReviews).to.equal(String(existingReviews.length + 1));
                const doctor = await db.Doctors.findOne({
                    where: { id: testDoctor.id }, attributes: ["rating"], raw: true
                });
                expect(doctor).to.have.property("rating", Number(expectedAverageRating));
            });
        });
        describe("GET /api/clinics/:clinicId/reviews", () => {
            let testClinicId;
            beforeEach(async () => {
                const testClinic = await db.Clinics.create({ name: faker.company.buzzAdjective(), password: faker.internet.password(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }), description: faker.lorem.sentence(), schedule: "Date" });
                await testClinic.addDoctor(testDoctor);
                const existingReviews = [
                    { patient_id: testPatient.id, doctor_id: testDoctor.id, rating: 4, comment: "Good doctor", tag_id: testTag.id },
                    { patient_id: testPatient.id, doctor_id: testDoctor.id, rating: 5, comment: "Excellent service", tag_id: testTag.id },
                    { patient_id: testPatient.id, doctor_id: testDoctor.id, rating: 3, comment: "Average experience", tag_id: testTag.id }
                ];
                const testReviews = await db.Reviews.bulkCreate(existingReviews);
                for (const review of testReviews) {
                    await review.addTag(testTag);
                }
                testClinicId = testClinic.id;
            });
            it("expect return reviews sorted by rating in descending order for a given clinicId, when the query has sortRating = 'DESC'", async () => {

                const response = await request(app)
                    .get(`/api/clinics/${testClinicId}/reviews`)
                    .query({ sortDate: 'ASC', sortRating: 'DESC', limit: 10, offset: 0 })
                    .expect(200);

                expect(response.body).to.be.an("array").that.is.not.empty;
                expect(response.body[0]).to.have.property("review");
                expect(response.body[0].review).to.have.property("doctor");
                expect(response.body[0].review.rating).to.be.greaterThan(response.body[1].review.rating);
                expect(response.body[0].review.doctor).to.have.property("user");
                expect(response.body[0].review.patient).to.have.property("user");
                expect(response.body[0]).to.have.property("tag");
            });
            it("expect return reviews sorted by rating in ascending order for a given clinicId, when the query has not sortRating", async () => {
                const response = await request(app)
                    .get(`/api/clinics/${testClinicId}/reviews`)
                    .query({ sortDate: 'ASC', limit: 10, offset: 0 })
                    .expect(200);

                expect(response.body).to.be.an("array").that.is.not.empty;
                expect(response.body[0]).to.have.property("review");
                expect(response.body[0].review).to.have.property("doctor");
                expect(response.body[0].review.rating).to.be.lessThan(response.body[1].review.rating);
                expect(response.body[0].review.doctor).to.have.property("user");
                expect(response.body[0].review.patient).to.have.property("user");
                expect(response.body[0]).to.have.property("tag");
            });
        });
        describe("GET /api/doctors/:doctorId/reviews", () => {
            let testDoctorId;
            beforeEach(async () => {
                const testClinic = await db.Clinics.create({ name: faker.company.buzzAdjective(), password: faker.internet.password(), nip: 1234567890, registration_day: faker.date.birthdate(), nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }), description: faker.lorem.sentence(), schedule: "Date" });
                await testClinic.addDoctor(testDoctor);
                const existingReviews = [
                    { patient_id: testPatient.id, doctor_id: testDoctor.id, rating: 4, comment: "Good doctor", tag_id: testTag.id },
                    { patient_id: testPatient.id, doctor_id: testDoctor.id, rating: 5, comment: "Excellent service", tag_id: testTag.id },
                    { patient_id: testPatient.id, doctor_id: testDoctor.id, rating: 3, comment: "Average experience", tag_id: testTag.id }
                ];
                const testReviews = await db.Reviews.bulkCreate(existingReviews);
                for (const review of testReviews) {
                    await review.addTag(testTag);
                }
                testDoctorId = testDoctor.id;
            });
            it("expect return reviews for a given clinicId, when they exists", async () => {
                const response = await request(app)
                    .get(`/api/doctors/${testDoctorId}/reviews`)
                    .expect(200);

                expect(response.body).to.be.an("array").that.is.not.empty;
                expect(response.body[0]).to.have.property("review");
                expect(response.body[0].review.rating).to.be.lessThan(response.body[1].review.rating);
                expect(response.body[0].review.patient).to.have.property("user");
                expect(response.body[0]).to.have.property("tag");
            });
        });
        describe("GET /api/reviews", () => {
            let sessionCookies, patientId;
            beforeEach(async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "admin",
                };
                const createdUser = await db.Users.create(fakeUser);
                const createdPatient = await testPatient.update({ user_id: createdUser.id });

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];
                patientId = createdPatient.id;
            });
            it("expect to create review and to set a rating for the doctor, when data is valid", async () => {
                const existingReviews = [
                    { patient_id: patientId, doctor_id: testDoctor.id, rating: 4, comment: "Good doctor" },
                    { patient_id: patientId, doctor_id: testDoctor.id, rating: 5, comment: "Excellent service" },
                    { patient_id: patientId, doctor_id: testDoctor.id, rating: 3, comment: "Average experience" }
                ];
                const testReviews = await db.Reviews.bulkCreate(existingReviews);
                for (const review of testReviews) {
                    await review.addTag(testTag);
                }

                const response = await request(app)
                    .get("/api/reviews")
                    .set('Cookie', sessionCookies)
                    .expect(200);
                console.log(response.body);
                expect(response.body).to.be.an("array");
                expect(response.body[0]).to.have.property("review");
                expect(response.body[0].review).to.have.property("doctor");
                expect(response.body[0].review).to.have.property("patient");
                expect(response.body[0]).to.have.property("tag");
            });
        });
        describe("DELETE /api/reviews/:id", () => {
            let sessionCookies, patientId;
            beforeEach(async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "admin",
                };
                const createdUser = await db.Users.create(fakeUser);
                const createdPatient = await testPatient.update({ user_id: createdUser.id });

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];
                patientId = createdPatient.id;
            });
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
                    .set('Cookie', sessionCookies)
                    .expect(200);

                const reviewInDb = await db.Reviews.findByPk(testReview.id);
                expect(reviewInDb).to.be.null;
            });
        });
    });
    describe("Negative tests", () => {
        describe("POST /api/reviews", () => {
            it("expect AppError('Unauthorized user'), when data is valid", async () => {
                const response = await request(app)
                    .post("/api/reviews")
                    .send({})
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Access denied'), when data is valid", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "admin",
                };
                await db.Users.create(fakeUser);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .post("/api/reviews")
                    .send({})
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect AppError('Doctor not found'), when data is valid", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient",
                };
                const createdUser = await db.Users.create(fakeUser);
                await testPatient.update({ user_id: createdUser.id });
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];
                const reviewData = {
                    patientId: testPatient.id,
                    doctorId: testDoctor.id + 1,
                };

                const response = await request(app)
                    .post("/api/reviews")
                    .send(reviewData)
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Doctor not found");
            });
        });
        describe("GET /api/reviews", () => {
            it("expect AppError('Unauthorized user'), when data is valid", async () => {
                const response = await request(app)
                    .get("/api/reviews")
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Access denied'), when data is valid", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient",
                };
                await db.Users.create(fakeUser);

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .get("/api/reviews")
                    .set('Cookie', sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
        });
        describe("DELETE /api/reviews/:id", () => {
            it("expect AppError('Unauthorized user'), when data is valid", async () => {
                const response = await request(app)
                    .delete("/api/reviews/1")
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Access denied'), when data is valid", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient",
                };
                await db.Users.create(fakeUser);

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .delete("/api/reviews/1")
                    .set('Cookie', sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
        });
    });
});