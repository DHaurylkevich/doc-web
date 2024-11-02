require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../doc-web");
const db = require("../../src/models");

describe("ScheduleController API", () => {
    let testDoctor, testClinic, testSchedule;
    before(async () => {
        await db.sequelize.sync({ force: true });
    });
    beforeEach(async () => {
        fakeDoctor = {
            rating: faker.number.float({ min: 1, max: 5 }),
            hired_at: faker.date.past(),
            description: faker.lorem.paragraph()
        };

        testClinic = await db.Clinics.create({
            name: faker.company.buzzAdjective(),
            nip: 1234567890,
            registration_day: faker.date.birthdate(),
            nr_license: faker.vehicle.vin(),
            email: faker.internet.email(),
            phone: faker.phone.number({ style: 'international' }),
            description: faker.lorem.sentence(),
            schedule: "Date"
        });

        // token = authMiddleware.createJWT(userId, fakeUser.role);
    });
    after(async () => {
        await db.Schedules.destroy({ where: {} });
        await db.Doctors.destroy({ where: {} });
        await db.Clinics.destroy({ where: {} });
    });

    describe("POST /api/user/login", () => {
        it("expect token, when user exists and data is valid", async () => {
            await db.sequelize.sync({ force: true });

            const loginParam = fakeUser.email;
            const password = "Test@1234";

            const response = await request(app)
                .post("/api/users/login")
                .send({ loginParam, password })
                .expect(200);

            expect(response.body).that.is.a("string");
        });
    });
    describe('POST /schedules/', () => {
        it('expect to create schedule for doctor and clinic', async () => {
            const testDoctor1 = await db.Doctors.create(fakeDoctor);
            const testDoctor2 = await db.Doctors.create(fakeDoctor);

            const scheduleData = {
                doctorsIds: [testDoctor1.id, testDoctor2.id,],
                clinic_id: testClinic.id,
                date: '2024-11-10',
                start_time: '09:00',
                end_time: '12:00',
                interval: 30,
            };

            const response = await request(app)
                .post("/api/schedules/")
                .send({ scheduleData: scheduleData })
                .expect(201);
            console.log(response.body);

            expect(response.body.length).to.equal(scheduleData.doctorsIds.length);
            expect(response.body[0].doctor_id).to.equal(scheduleData.doctorsIds[0]);
        });
    });
    describe('GET /schedules/:id', () => {
        it('expect schedule', async () => {
            testDoctor = await db.Doctors.create(fakeDoctor);

            const scheduleData = {
                doctor_id: testDoctor.id,
                clinic_id: testClinic.id,
                date: '2024-11-10',
                start_time: '09:00',
                end_time: '12:00',
            };
            const createdSchedule = await db.Schedules.create(scheduleData);

            const response = await request(app)
                .get(`/api/schedules/${createdSchedule.id}`)
                .expect(200);
            console.log(response.body);

            expect(response.body).to.include(scheduleData);
        });

        it('should return 404 when schedule not found', async () => {
            const res = await chai.request(app)
                .get('/api/schedules/9999'); // предполагаем, что такого расписания нет

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Schedule not found');
        });
    });

    describe('PUT /schedules/:id', () => {
        it('should update an existing schedule', async () => {
            const scheduleData = {
                doctor_id: testDoctor.id,
                clinic_id: testClinic.id,
                date: '2024-11-10',
                start_time: '09:00',
                end_time: '12:00',
            };

            const createdSchedule = await db.Schedules.create(scheduleData);

            const updateData = {
                start_time: '10:00',
                end_time: '13:00',
            };

            const res = await chai.request(app)
                .put(`/api/schedules/${createdSchedule.id}`)
                .send(updateData);

            expect(res).to.have.status(200);
            expect(res.body.start_time).to.equal(updateData.start_time);
            expect(res.body.end_time).to.equal(updateData.end_time);
        });

        it('should return 404 when schedule to update not found', async () => {
            const updateData = {
                start_time: '10:00',
                end_time: '13:00',
            };

            const res = await chai.request(app)
                .put('/api/schedules/9999')
                .send(updateData);

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Schedule not found');
        });
    });

    describe('DELETE /schedules/:id', () => {
        it('should delete a schedule by id', async () => {
            const scheduleData = {
                doctor_id: testDoctor.id,
                clinic_id: testClinic.id,
                date: '2024-11-10',
                start_time: '09:00',
                end_time: '12:00',
            };

            const createdSchedule = await db.Schedules.create(scheduleData);

            const res = await chai.request(app)
                .delete(`/api/schedules/${createdSchedule.id}`);

            expect(res).to.have.status(200);

            const checkRes = await chai.request(app)
                .get(`/api/schedules/${createdSchedule.id}`);
            expect(checkRes).to.have.status(404);
        });

        it('should return 404 when deleting non-existing schedule', async () => {
            const res = await chai.request(app)
                .delete('/api/schedules/9999'); // предполагаем, что такого расписания нет

            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message', 'Schedule not found');
        });
    });
});