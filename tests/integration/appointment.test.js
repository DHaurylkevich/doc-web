require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("AppointmentController API", () => {
    let testUser, testPatient, testDoctor, testClinic, testService, testSpecialty, testDoctorService, testSchedule;

    const createTestUser = async () => {
        return await db.Users.create({
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            phone: faker.phone.number({ style: 'international' }),
            pesel: 12345678901,
            password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
            role: "patient",
            birthday: faker.date.past(30)
        });
    };

    const createTestClinic = async () => {
        return await db.Clinics.create({
            name: faker.company.buzzAdjective(),
            nip: 1234567890,
            password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
            registration_day: faker.date.birthdate(),
            nr_license: faker.vehicle.vin(),
            email: faker.internet.email(),
            phone: faker.phone.number({ style: 'international' }),
            description: faker.lorem.sentence(),
            schedule: "Date"
        });
    };

    const createTestDoctor = async (clinicId, specialtyId, userId) => {
        return await db.Doctors.create({
            user_id: userId,
            rating: faker.number.float({ min: 1, max: 5 }),
            hired_at: faker.date.past(),
            description: faker.lorem.paragraph(),
            clinic_id: clinicId,
            specialty_id: specialtyId,
        });
    };

    beforeEach(async () => {
        testUser = await createTestUser();
        testPatient = await db.Patients.create({ user_id: testUser.id, gender: "male", market_inf: false });
        testClinic = await createTestClinic();
        testSpecialty = await db.Specialties.create({ name: "Cardiology" });
        testService = await db.Services.create({ name: "cut", price: 10, specialty_id: testSpecialty.id, clinic_id: testClinic.id });
        testDoctor = await createTestDoctor(testClinic.id, testSpecialty.id, testUser.id);
        testSchedule = await db.Schedules.create({
            doctor_id: testDoctor.id,
            clinic_id: testClinic.id,
            date: '2024-11-10',
            start_time: '09:00',
            end_time: '12:00',
            interval: 30,
        });
        testDoctorService = await db.DoctorService.create({ doctor_id: testDoctor.id, service_id: testService.id });
    });
    afterEach(async () => {
        await db.Schedules.destroy({ where: {} });
        await db.DoctorService.destroy({ where: {} });
        await db.Services.destroy({ where: {} });
        await db.Specialties.destroy({ where: {} });
        await db.Clinics.destroy({ where: {} });
        await db.Doctors.destroy({ where: {} });
        await db.Patients.destroy({ where: {} });
        await db.Users.destroy({ where: {} });
        await db.Appointments.destroy({ where: {} });
    });
    describe("Positive tests", () => {
        describe("POST /api/appointments", () => {
            it("expect to create service, when data is valid", async () => {
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];
                const fakeAppointment = {
                    doctorId: testDoctor.id,
                    doctorServiceId: testDoctorService.id,
                    clinicId: testClinic.id,
                    userId: testUser.id,
                    date: "2024-11-10", timeSlot: "09:30",
                    firstVisit: true, visitType: "NFZ",
                    status: "active", description: "Help me, plz"
                };

                const response = await request(app)
                    .post("/api/appointments")
                    .send(fakeAppointment)
                    .set("Cookie", sessionCookies)
                    .expect(201);

                expect(response.body).that.is.a("object");
                expect(response.body.clinic_id).to.equals(fakeAppointment.clinicId);
                expect(response.body.doctor_service_id).to.equals(fakeAppointment.doctorServiceId);
                expect(response.body.time_slot.slice(0, -3)).to.equals(fakeAppointment.timeSlot);
            });
        });
        describe("GET /api/appointments/", () => {
            let testAddress, testAppointment;
            beforeEach(async () => {
                testAppointment = await db.Appointments.create({
                    clinic_id: testClinic.id,
                    schedule_id: testSchedule.id,
                    patient_id: testPatient.id,
                    doctor_service_id: testDoctorService.id,
                    time_slot: "09:30",
                    description: "Help me, pls",
                    first_visit: true,
                    visit_type: "NFZ",
                    status: "active"
                });
                testAddress = await db.Addresses.create({ city: faker.location.city(), street: faker.location.street(), home: faker.location.buildingNumber(), flat: faker.location.buildingNumber(), post_index: faker.location.zipCode(), province: faker.location.state() });
                await testClinic.setAddress(testAddress.id);
            });
            it("expect to get services city,specialty,date filter, when they exist", async () => {
                const response = await request(app)
                    .get(`/api/appointments?city=${testAddress.city}&specialty=${testSpecialty.name}&date=${testSchedule.date}`)
                    .expect(200);

                expect(response.body).to.be.an("array").that.is.not.empty;
                expect(response.body[0]).to.include.keys("doctor_id", "description", "rating", "specialty", "address", "date");
                expect(response.body[0].slots).to.not.include(testAppointment.timeSlot);
            });
            it("expect to get services with city,specialty filter, when they exist", async () => {
                const response = await request(app)
                    .get(`/api/appointments?city=${testAddress.city}&specialty=${testSpecialty.name}`)
                    .expect(200);

                expect(response.body).to.be.an("array").that.is.not.empty;
                expect(response.body[0]).to.include.keys("doctor_id", "description", "rating", "specialty", "address", "date");
                expect(response.body[0].slots).to.not.include(testAppointment.timeSlot);
            });
            it("expect to get services with city filter, when they exist", async () => {
                const response = await request(app)
                    .get(`/api/appointments?city=${testAddress.city}`)
                    .expect(200);

                expect(response.body).to.be.an("array").that.is.not.empty;
                expect(response.body[0]).to.include.keys("doctor_id", "description", "rating", "specialty", "address", "date");
                expect(response.body[0].slots).to.not.include(testAppointment.timeSlot);
            });
            it("expect to get empty array, when they don't exist", async () => {
                const response = await request(app)
                    .get("/api/appointments?city=Foo")
                    .expect(200);

                expect(response.body).to.be.an("array").that.is.empty;
            });
            it("expect to get services without filters, when they exist", async () => {
                const response = await request(app)
                    .get("/api/appointments")
                    .expect(200);

                expect(response.body).to.be.an("array").that.is.not.empty;
                expect(response.body[0]).to.include.keys("doctor_id", "description", "rating", "specialty", "address", "date");
                expect(response.body[0].slots).to.not.include(testAppointment.timeSlot);
            });
        });
        describe("GET /api/clinics/:clinicId/appointments/", () => {
            it("expect appointments by doctorId, when they exist", async () => {
                const testAppointment = await db.Appointments.create({
                    clinic_id: testClinic.id,
                    schedule_id: testSchedule.id,
                    patient_id: testPatient.id,
                    doctor_service_id: testDoctorService.id,
                    time_slot: "09:30",
                    description: "Help me, pls",
                    first_visit: true,
                    visit_type: "NFZ",
                    status: "active"
                });

                const response = await request(app)
                    .get(`/api/clinics/${testClinic.id}/appointments`)
                    .expect(200);
                console.log(testAppointment.doctor_service_id);
                console.log(response.body[0]);
                expect(response.body).to.be.an("array").that.is.not.empty;
                expect(response.body[0]).to.have.property("start_time", testAppointment.time_slot.slice(0, -3));
                expect(response.body[0]).to.have.property("doctor");
                expect(response.body[0]).to.have.property("patient");
                expect(response.body[0]).to.have.property("specialty");
            });
        });
        describe("GET /api/doctor/:doctorId/appointments/", () => {
            it("expect appointments without filters by doctorId, when they exist", async () => {
                const testAppointment = await db.Appointments.create({
                    clinic_id: testClinic.id,
                    schedule_id: testSchedule.id,
                    patient_id: testPatient.id,
                    doctor_service_id: testDoctorService.id,
                    time_slot: "09:30:00",
                    description: "Help me, pls",
                    first_visit: true,
                    visit_type: "NFZ",
                    status: "active"
                });

                const response = await request(app)
                    .get(`/api/doctors/${testDoctor.id}/appointments`)
                    .expect(200);

                expect(response.body).to.be.an("array").that.is.not.empty;
                expect(response.body[0]).to.have.property("start_time", testAppointment.time_slot.slice(0, -3));
            });
            it("expect empty array, when set a different status filter ", async () => {
                await db.Appointments.create({
                    clinic_id: testClinic.id,
                    schedule_id: testSchedule.id,
                    patient_id: testPatient.id,
                    doctor_service_id: testDoctorService.id,
                    time_slot: "09:30:00",
                    description: "Help me, pls",
                    first_visit: true,
                    visit_type: "NFZ",
                    status: "active"
                });

                const response = await request(app)
                    .get(`/api/doctors/${testDoctor.id}/appointments?status=completed`)
                    .expect(200);

                expect(response.body).to.be.an("array").that.is.empty;
            });
            it("expect to get empty array by doctorId, when they don't exist", async () => {
                const response = await request(app)
                    .get("/api/doctors/1/appointments")
                    .expect(200);

                expect(response.body).to.be.an("array").that.is.empty;
            });
        });
        describe("GET /api/patients/:doctorId/appointments/", () => {
            it("expect appointments with data filter by patientId, when they exist", async () => {
                const testAppointment = await db.Appointments.create({
                    clinic_id: testClinic.id,
                    schedule_id: testSchedule.id,
                    patient_id: testPatient.id,
                    doctor_service_id: testDoctorService.id,
                    time_slot: "09:30:00",
                    description: "Help me, pls",
                    first_visit: true,
                    visit_type: "NFZ",
                    status: "active"
                });

                const response = await request(app)
                    .get(`/api/patients/${testPatient.id}/appointments?startDate=${testSchedule.date}&endData=${testSchedule.date}`)
                    .expect(200);

                expect(response.body).to.be.an("array").that.is.not.empty;
                expect(response.body[0]).to.have.property("start_time", testAppointment.time_slot.slice(0, -3));
                expect(response.body[0]).to.have.property("doctor");
            });
            it("expect appointments without filters by patientId, when they exist", async () => {
                const testAppointment = await db.Appointments.create({
                    clinic_id: testClinic.id,
                    schedule_id: testSchedule.id,
                    patient_id: testPatient.id,
                    doctor_service_id: testDoctorService.id,
                    time_slot: "09:30:00",
                    description: "Help me, pls",
                    first_visit: true,
                    visit_type: "NFZ",
                    status: "active"
                });

                const response = await request(app)
                    .get(`/api/patients/${testPatient.id}/appointments`)
                    .expect(200);

                expect(response.body).to.be.an("array").that.is.not.empty;
                expect(response.body[0]).to.have.property("start_time", testAppointment.time_slot.slice(0, -3));
                expect(response.body[0]).to.have.property("doctor");
            });
            it("expect empty array by patientId, when they don't exist", async () => {
                const response = await request(app)
                    .get("/api/patients/1/appointments")
                    .expect(200);

                expect(response.body).to.be.an("array").that.is.empty;
            });
        });
        describe("DELETE /api/appointments/:id", () => {
            it("expect delete service by id, when it exists", async () => {
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];
                const testAppointment = await db.Appointments.create({
                    clinic_id: testClinic.id,
                    schedule_id: testSchedule.id,
                    patients_id: testPatient.id,
                    doctor_service_id: testDoctorService.id,
                    time_slot: "09:30",
                    description: "Help me, pls",
                    first_visit: true,
                    visit_type: "NFZ",
                    status: "active"
                });

                const response = await request(app)
                    .delete(`/api/appointments/${testAppointment.id}`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("message", "Successful delete");
                const appointmentInDb = await db.Appointments.findByPk(testAppointment.id);
                expect(appointmentInDb).to.be.null;
            });
        });
    });
    describe("Negative tests", () => {
        describe("POST /api/appointments", () => {
            let sessionCookies;
            beforeEach(async () => {
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];
            });
            it("expect AppError('Unauthorized user')", async () => {
                const response = await request(app)
                    .post("/api/appointments")
                    .send({})
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('This Schedule doesn't exist'), when schedule not exist", async () => {
                const fakeAppointment = {
                    doctorId: testDoctor.id + 1,
                    doctorServiceId: testDoctorService.id,
                    clinicId: testClinic.id,
                    userId: testUser.id,
                    date: "2024-11-10", timeSlot: "09:30",
                    firstVisit: true, visitType: "NFZ",
                    status: "active", description: "Help me, plz"
                }

                const response = await request(app)
                    .post("/api/appointments")
                    .send(fakeAppointment)
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "This Schedule doesn't exist");
            });
            it("expect AppError('This time slot is not available'), when time slot not exist", async () => {
                const fakeAppointment = {
                    doctorId: testDoctor.id,
                    doctorServiceId: testDoctorService.id,
                    clinicId: testClinic.id,
                    userId: testUser.id,
                    date: "2024-11-10", timeSlot: "08:00",
                    firstVisit: true, visitType: "NFZ",
                    status: "active", description: "Help me, plz"
                }

                const response = await request(app)
                    .post("/api/appointments")
                    .send(fakeAppointment)
                    .set("Cookie", sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("message", "This time slot is not available");
            });
            it("expect AppError('This time slot is not free'), when time slot isn't free", async () => {
                await db.Appointments.create({
                    schedule_id: testSchedule.id,
                    doctor_id: testDoctor.id,
                    doctor_service_id: testDoctorService.id,
                    clinic_id: testClinic.id,
                    user_id: testUser.id,
                    date: "2024-11-10", time_slot: "09:00",
                    firstVisit: true, visitType: "NFZ",
                    status: "active", description: "Help me, plz"
                });
                const fakeAppointment = {
                    doctorId: testDoctor.id,
                    doctorServiceId: testDoctorService.id,
                    clinicId: testClinic.id,
                    userId: testUser.id,
                    date: "2024-11-10", timeSlot: "09:00",
                    firstVisit: true, visitType: "NFZ",
                    status: "active", description: "Help me, plz"
                }

                const response = await request(app)
                    .post("/api/appointments")
                    .send(fakeAppointment)
                    .set("Cookie", sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("message", "This time slot is not free");
            });
            it("expect AppError('This doctor service doesn't exist'), when service not exist", async () => {
                const fakeAppointment = {
                    doctorId: testDoctor.id,
                    doctorServiceId: testDoctorService.id + 1,
                    clinicId: testClinic.id,
                    userId: testUser.id,
                    date: "2024-11-10", timeSlot: "09:30",
                    firstVisit: true, visitType: "NFZ",
                    status: "active", description: "Help me, plz"
                }

                const response = await request(app)
                    .post("/api/appointments")
                    .send(fakeAppointment)
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "This doctor service doesn't exist");
            });
        });
        describe("DELETE /api/appointments/:id", () => {
            it("expect AppError('Unauthorized user')", async () => {
                const response = await request(app)
                    .delete("/api/appointments/1")
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Appointment not found'), when appointment not exist", async () => {
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .delete("/api/appointments/1")
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Appointment not found");
            });
        });
    });
});