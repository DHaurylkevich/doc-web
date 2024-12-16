process.env.NODE_ENV = "test";

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require("@faker-js/faker");
const app = require("../../index");
const db = require("../../src/models");

describe("ScheduleController API", () => {
    let testDoctor, testClinic, fakeDoctor;

    beforeEach(async () => {
        testClinic = await db.Clinics.create({
            name: faker.company.buzzAdjective(),
            password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
            nip: 1234567890,
            nr_license: faker.vehicle.vin(),
            email: faker.internet.email(),
            phone: faker.phone.number({ style: "international" }),
            description: faker.lorem.sentence()
        });
        fakeDoctor = {
            clinic_id: testClinic.id,
            rating: faker.number.float({ min: 1, max: 5 }),
            hired_at: faker.date.past(),
            description: faker.lorem.paragraph()
        };
        testDoctor = await db.Doctors.create(fakeDoctor);
    });
    afterEach(async () => {
        await db.Users.destroy({ where: {} });
        await db.Schedules.destroy({ where: {} });
        await db.Doctors.destroy({ where: {} });
        await db.Clinics.destroy({ where: {} });
    });
    describe("Positive tests", () => {

        describe("POST /clinics/:clinicId/schedules/", () => {
            let sessionCookies;

            beforeEach(async () => {
                const response = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(response.body).to.have.property("user");

                sessionCookies = response.headers['set-cookie'];
            });
            it("expect to create schedule for two doctors by clinic, when one date is set", async () => {
                const testDoctor2 = await db.Doctors.create(fakeDoctor);

                const scheduleData = {
                    doctorsIds: [testDoctor.id, testDoctor2.id,],
                    interval: 30,
                    dates: ["2024-11-10"],
                    start_time: "09:00",
                    end_time: "12:00",
                };

                const response = await request(app)
                    .post(`/api/clinics/${testClinic.id}/schedules/`)
                    .send(scheduleData)
                    .set("Cookie", sessionCookies)
                    .expect(201);

                expect(response.body.length).to.equal(scheduleData.doctorsIds.length);
                expect(response.body[0]).to.have.property("doctor_id", scheduleData.doctorsIds[0]);
                expect(response.body[0]).to.have.property("interval", scheduleData.interval);
                expect(response.body[0]).to.have.property("date", scheduleData.dates[0]);
            });
            it("expect to create schedule for two doctors by clinic, when two date is set", async () => {
                const testDoctor2 = await db.Doctors.create(fakeDoctor);

                const scheduleData = {
                    doctorsIds: [testDoctor.id, testDoctor2.id,],
                    interval: 30,
                    dates: ["2024-11-10", "2024-11-11"],
                    start_time: "09:00",
                    end_time: "12:00",
                };

                const response = await request(app)
                    .post(`/api/clinics/${testClinic.id}/schedules/`)
                    .send(scheduleData)
                    .set("Cookie", sessionCookies)
                    .expect(201);

                scheduleData.doctorsIds.forEach((doctorId, doctorIndex) => {
                    scheduleData.dates.forEach((date, dateIndex) => {
                        const index = doctorIndex * scheduleData.dates.length + dateIndex;
                        expect(response.body[index]).to.have.property("doctor_id", doctorId);
                        expect(response.body[index]).to.have.property("date", date);
                    });
                });
                expect(response.body[0]).to.have.property("interval", scheduleData.interval);
            });
        });
        describe("GET /schedules/:scheduleId", () => {
            it("expect to get schedule by id, when it exists", async () => {
                const scheduleData = {
                    doctor_id: testDoctor.id,
                    clinic_id: testClinic.id,
                    date: "2024-11-10",
                    start_time: "09:00",
                    end_time: "12:00",
                    interval: 30,
                };
                const createdSchedule = await db.Schedules.create(scheduleData);

                const response = await request(app)
                    .get(`/api/schedules/${createdSchedule.id}`)
                    .expect(200);

                expect(response.body.id).to.deep.equals(createdSchedule.id);
                expect(response.body.doctor_id).to.deep.equals(createdSchedule.doctor_id);
            });
        });
        describe("GET /doctors/:doctorId/schedules", () => {
            it("expect to get schedule by doctorId, when it exists", async () => {
                const scheduleData = {
                    doctor_id: testDoctor.id,
                    clinic_id: testClinic.id,
                    date: "2024-11-10",
                    start_time: "09:00",
                    end_time: "12:00",
                    interval: 30,
                };
                const createdSchedule = await db.Schedules.create(scheduleData);

                const response = await request(app)
                    .get(`/api/doctors/${testDoctor.id}/schedules/`)
                    .expect(200);
                console.log(response.body);

                expect(response.body[0].id).to.equals(createdSchedule.id);
                expect(response.body[0].doctor_id).to.deep.equals(createdSchedule.doctor_id);
            });
            it("expect empty array, when schedule doesn't exist", async () => {
                const response = await request(app)
                    .get(`/api/doctors/${testDoctor.id}/schedules/`)
                    .expect(200);
                console.log(response.body);

                expect(response.body).to.be.an("array");
            });
        });
        describe("GET /clinics/:doctorId/schedules", () => {
            it("expect to get schedule by clinicId, when it exists", async () => {
                const scheduleData = {
                    doctor_id: testDoctor.id,
                    clinic_id: testClinic.id,
                    date: "2024-11-10",
                    start_time: "09:00",
                    end_time: "12:00",
                    interval: 30,
                };
                const createdSchedule = await db.Schedules.create(scheduleData);

                const response = await request(app)
                    .get(`/api/clinics/${testClinic.id}/schedules/`)
                    .expect(200);
                console.log(response.body);

                expect(response.body[0].id).to.equals(createdSchedule.id);
                expect(response.body[0].clinic_id).to.deep.equals(createdSchedule.clinic_id);
            });
            it("expect empty array, when schedule doesn't exist", async () => {
                const response = await request(app)
                    .get(`/api/clinics/${testClinic.id}/schedules/`)
                    .expect(200);
                console.log(response.body);

                expect(response.body).to.be.an("array");
            });
        });
        describe("PUT /schedules/:id", () => {
            let sessionCookies;

            beforeEach(async () => {
                const response = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(response.body).to.have.property("user");

                sessionCookies = response.headers['set-cookie'];
            });
            it("expect to update schedule, when it exists", async () => {
                const scheduleData = {
                    doctor_id: testDoctor.id,
                    clinic_id: testClinic.id,
                    date: "2024-11-10",
                    start_time: "09:00",
                    end_time: "12:00",
                    interval: 30,
                };
                const createdSchedule = await db.Schedules.create(scheduleData);
                const updateData = {
                    start_time: "10:00",
                    end_time: "13:00",
                    interval: 60,
                };

                const response = await request(app)
                    .put(`/api/schedules/${createdSchedule.id}`)
                    .send(updateData)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body.start_time).to.equal(updateData.start_time);
                expect(response.body.end_time).to.equal(updateData.end_time);
                expect(response.body.interval).to.equal(updateData.interval);
            });
        });
        describe("DELETE /schedules/:id", () => {
            it("expect to delete schedule, when it exists", async () => {
                const scheduleData = {
                    doctor_id: testDoctor.id,
                    clinic_id: testClinic.id,
                    date: "2024-11-10",
                    start_time: "09:00",
                    end_time: "12:00",
                };
                const createdSchedule = await db.Schedules.create(scheduleData);

                const response = await request(app)
                    .delete(`/api/schedules/${createdSchedule.id}`)
                    .expect(200);

                expect(response.body).to.have.property("message", "Successful delete");
                const schedule = await db.Schedules.findByPk(createdSchedule.id)
                expect(schedule).to.not.exist;
            });
        });
    });
    describe("Negative tests", () => {
        describe("POST /clinics/:clinicId/schedules/", () => {
            let sessionCookies;

            beforeEach(async () => {
                const response = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(response.body).to.have.property("user");

                sessionCookies = response.headers['set-cookie'];
            });
            it("expect AppError('Unauthorized user'), when user don't unauthorize", async () => {
                const testDoctor2 = await db.Doctors.create(fakeDoctor);

                const scheduleData = {
                    doctorsIds: [testDoctor.id, testDoctor2.id,],
                    interval: 30,
                    dates: ["2024-11-10"],
                    start_time: "09:00",
                    end_time: "12:00",
                };

                const response = await request(app)
                    .post(`/api/clinics/${testClinic.id}/schedules/`)
                    .send(scheduleData)
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Clinic authorized error'), when doctor doesn't exist", async () => {
                const id = testClinic.id + 1;

                const response = await request(app)
                    .post(`/api/clinics/${id}/schedules/`)
                    .send("test")
                    .set("Cookie", sessionCookies)
                    .expect(401);

                expect(response.body).to.have.property("message", "Clinic authorized error");
            });
            it("expect AppError('One or more doctors not found'), when doctor doesn't exist", async () => {
                const scheduleData = {
                    doctorsIds: [1],
                    interval: 30,
                    dates: ["2024-11-10"],
                    start_time: "09:00",
                    end_time: "12:00",
                };

                const response = await request(app)
                    .post(`/api/clinics/${testClinic.id}/schedules/`)
                    .send(scheduleData)
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "One or more doctors not found");
            });
            it("expect AppError('One or more schedules already exist'), when schedule exists", async () => {
                const scheduleData = {
                    doctorsIds: [testDoctor.id],
                    interval: 30,
                    dates: ["2024-11-10"],
                    start_time: "09:00",
                    end_time: "12:00",
                };
                await request(app)
                    .post(`/api/clinics/${testClinic.id}/schedules/`)
                    .send(scheduleData)
                    .set("Cookie", sessionCookies)
                    .expect(201);

                const response = await request(app)
                    .post(`/api/clinics/${testClinic.id}/schedules/`)
                    .send(scheduleData)
                    .set("Cookie", sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("message", "One or more schedules already exist");
            });
        });
        describe("GET /schedules/:id", () => {
            it("expect AppError('Schedule not found'), when schedule doesn't exist", async () => {
                const response = await request(app)
                    .get("/api/schedules/1")
                    .expect(404);

                expect(response.body).to.have.property("message", "Schedule not found");
            });
        });
        describe("PUT /schedules/:id", () => {
            let sessionCookies;

            beforeEach(async () => {
                const response = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(response.body).to.have.property("user");

                sessionCookies = response.headers['set-cookie'];
            });
            it("expect AppError('Schedule not found'), when schedule doesn't exist", async () => {
                const response = await request(app)
                    .put("/api/schedules/1")
                    .send()
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Schedule not found");
            });
            it("expect AppError('Unauthorized user'), when schedule doesn't exist", async () => {
                const response = await request(app)
                    .put("/api/schedules/1")
                    .send()
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
        });
        describe("DELETE /schedules/:id", () => {
            it("expect AppError('Schedule not found'), when schedule doesn't exist", async () => {
                const response = await request(app)
                    .delete("/api/schedules/1")
                    .expect(404);

                expect(response.body).to.have.property("message", "Schedule not found");
            });
        });
    });
});