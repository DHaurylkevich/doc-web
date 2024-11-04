require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../doc-web");
const db = require("../../src/models");

describe("AppointmentController API", () => {
    let testUser, testPatient, testDoctor, testClinic, testService, testSpecialty, testDoctorService, testSchedule, testAppointment;

    before(async () => {
        await db.sequelize.sync({ force: true });
    });

    const createTestUser = async () => {
        return await db.Users.create({
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            phone: faker.phone.number({ style: 'international' }),
            pesel: 12345678,
            password: "Test@1234",
            role: "patient",
            birthday: faker.date.past(30)
        });
    };

    const createTestClinic = async () => {
        return await db.Clinics.create({
            name: faker.company.buzzAdjective(),
            nip: 1234567890,
            registration_day: faker.date.birthdate(),
            nr_license: faker.vehicle.vin(),
            email: faker.internet.email(),
            phone: faker.phone.number({ style: 'international' }),
            description: faker.lorem.sentence(),
            schedule: "Date"
        });
    };

    const createTestDoctor = async (clinicId, specialtyId) => {
        return await db.Doctors.create({
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
        testService = await db.Services.create({ name: "cut", price: 10, specialty_id: testSpecialty.id });
        testDoctor = await createTestDoctor(testClinic.id, testSpecialty.id);
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

    describe("POST /api/appointments", () => {
        it("expect to create service, when data is valid", async () => {
            const fakeAppointment = {
                doctorId: testDoctor.id,
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
                .expect(201);
            console.log(response.body);
            expect(response.body).that.is.a("object");
            expect(response.body.clinic_id).to.equals(fakeAppointment.clinicId);
            expect(response.body.doctor_service_id).to.equals(fakeAppointment.doctorServiceId);
            expect(response.body.timeSlot).to.equals(fakeAppointment.timeSlot);
        });
    });
    describe("GET /api/appointments/", () => {
        let testAddress;
        beforeEach(async () => {
            testAppointment = await db.Appointments.create({
                clinic_id: testClinic.id,
                schedule_id: testSchedule.id,
                patient_id: testPatient.id,
                doctor_service_id: testDoctorService.id,
                timeSlot: "09:30",
                description: "Help me, pls",
                first_visit: true,
                visit_type: "NFZ",
                status: "active"
            });
            testAddress = await db.Addresses.create({ city: faker.location.city(), street: faker.location.street(), home: faker.location.buildingNumber(), flat: faker.location.buildingNumber(), post_index: faker.location.zipCode() });
            await testClinic.setAddress(testAddress.id);
        });
        it("expect services, when they exists", async () => {
            const response = await request(app)
                .get(`/api/appointments?city=${testAddress.city}&specialty=${testSpecialty.name}&date=${testSchedule.date}`)
                .expect(200);

            expect(response.body).to.be.an("array").that.is.not.empty;
            expect(response.body[0]).to.include.keys("doctor_id", "description", "rating", "specialty", "address", "date");
            expect(response.body[0].slots).to.not.include(testAppointment.timeSlot);
        });
    });
    describe("GET /api/doctor/:doctorId/appointments/", () => {
        it("expect appointments by doctorId, when they exists", async () => {
            testAppointment = await db.Appointments.create({
                clinic_id: testClinic.id,
                schedule_id: testSchedule.id,
                patient_id: testPatient.id,
                doctor_service_id: testDoctorService.id,
                timeSlot: "09:30:00",
                description: "Help me, pls",
                first_visit: true,
                visit_type: "NFZ",
                status: "active"
            });

            const response = await request(app)
                .get(`/api/doctors/${testDoctor.id}/appointments`)
                .expect(200);

            expect(response.body).to.be.an("array").that.is.not.empty;
            expect(response.body[0]).to.include({ timeSlot: testAppointment.timeSlot });
            expect(response.body[0].doctorService.doctor_id).to.equal(testDoctor.id);
        });
    });
    describe("GET /api/patients/:doctorId/appointments/", () => {
        it("expect appointments by patientId, when they exists", async () => {
            testAppointment = await db.Appointments.create({
                clinic_id: testClinic.id,
                schedule_id: testSchedule.id,
                patient_id: testPatient.id,
                doctor_service_id: testDoctorService.id,
                timeSlot: "09:30:00",
                description: "Help me, pls",
                first_visit: true,
                visit_type: "NFZ",
                status: "active"
            });

            const response = await request(app)
                .get(`/api/patients/${testPatient.id}/appointments`)
                .expect(200);

            expect(response.body).to.be.an("array").that.is.not.empty;
            expect(response.body[0]).to.include({ timeSlot: testAppointment.timeSlot });
            expect(response.body[0].doctorService.doctor_id).to.equal(testDoctorService.doctor_id);
        });
    });
    describe("DELETE /api/appointments/:id", () => {
        it("expect delete service by id, when it exists", async () => {
            const testAppointment = await db.Appointments.create({
                clinic_id: testClinic.id,
                schedule_id: testSchedule.id,
                patients_id: testPatient.id,
                doctor_service_id: testDoctorService.id,
                timeSlot: "09:30",
                description: "Help me, pls",
                first_visit: true,
                visit_type: "NFZ",
                status: "active"
            });

            await request(app)
                .delete(`/api/appointments/${testAppointment.id}`)
                .expect(200);

            const appointmentInDb = await db.Appointments.findByPk(testAppointment.id);
            expect(appointmentInDb).to.be.null;
        });
    });
});