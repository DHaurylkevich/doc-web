require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const db = require("../../../src/models");
const AppointmentService = require("../../../src/services/appointmentService");
const ScheduleService = require("../../../src/services/scheduleService");
const DoctorService = require("../../../src/services/doctorService");
const ClinicService = require("../../../src/services/clinicService");
const UserService = require("../../../src/services/userService");

use(chaiAsPromised);

describe("Appointment Service", () => {
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive tests", () => {
        describe("createAppointment() =>:", () => {
            let doctorByIdStub, clinicByIdStub, userByIdStub, scheduleByIdStub, appointmentStub;

            beforeEach(() => {
                doctorByIdStub = sinon.stub(DoctorService, "getDoctorById");
                clinicByIdStub = sinon.stub(ClinicService, "getClinicById");
                userByIdStub = sinon.stub(UserService, "getUserById");
                scheduleByIdStub = sinon.stub(ScheduleService, "getScheduleById");
                appointmentStub = sinon.stub(db.Appointments, "findOne");
                createStub = sinon.stub(db.Appointments, "create");
            });
            it("expect create a new appointment, when valid data is provided", async () => {
                const appointment = { doctor_id: 1, user_id: 1, clinic_id: 1, schedule_id: 1, time: "10:00", description: "First visit", first_visit: "prywatna", visit_type: "consultation", status: "scheduled" };
                const schedule = { start_time: "09:00", end_time: "17:00", interval: 30 };
                doctorByIdStub.resolves({ id: 1 });
                clinicByIdStub.resolves({ id: 1 });
                userByIdStub.resolves({ getPatients: () => ({ id: 2 }) });
                scheduleByIdStub.resolves(schedule);
                appointmentStub.resolves(null);
                createStub.resolves({ id: 1, ...appointment, patients_id: 2 });


                const result = await AppointmentService.createAppointment(appointment);

                expect(doctorByIdStub.calledOnceWith(1)).to.be.true;
                expect(clinicByIdStub.calledOnceWith(1)).to.be.true;
                expect(userByIdStub.calledOnceWith(1)).to.be.true;
                expect(createStub.calledOnce).to.be.true;
                expect(result).to.deep.equal({ id: 1, ...appointment, patients_id: 2 });
            });
        });
        describe("getScheduleById() =>:", () => {
            let findByPkStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Appointments, "findByPk");
            });
            it("expect return specialty by id, when it is", async () => {
                const appointment = { id: 1, name: "Foo" };
                findByPkStub.resolves(appointment);

                const result = await AppointmentService.getAppointmentById(1);

                expect(findByPkStub.calledOnceWith(1, { include: [db.Doctors, db.Clinics, db.Patients, db.Schedules] })).to.be.true;
                expect(result).to.deep.equals(appointment);
            });
        });
        describe("updateAppointment() =>:", () => {
            let updateStub, findByPkStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Appointments, "findByPk");
                updateStub = sinon.stub();
            });
            it("expect update schedule, when valid data", async () => {
                findByPkStub.resolves({ update: updateStub });
                updateStub.resolves("Foo");

                const result = await AppointmentService.updateAppointment(1, "Foo");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(updateStub.calledOnceWith("Foo")).to.be.true;
                expect(result).to.equal("Foo");
            });
        });
        describe("deleteAppointment() =>:", () => {
            let destroyStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Appointments, "findByPk");
                destroyStub = sinon.stub();
            });
            it("expect delete appointment, when valid data", async () => {
                findByPkStub.resolves({ destroy: destroyStub });
                destroyStub.resolves();

                await AppointmentService.deleteAppointment(1);

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(destroyStub.calledOnce).to.be.true;
            });
        });
    });
    describe("Negative tests", () => {
        describe("createAppointment() =>:", () => {
            let doctorByIdStub, clinicByIdStub, userByIdStub, scheduleByIdStub, appointmentStub;


            beforeEach(() => {
                doctorByIdStub = sinon.stub(DoctorService, "getDoctorById");
                clinicByIdStub = sinon.stub(ClinicService, "getClinicById");
                userByIdStub = sinon.stub(UserService, "getUserById");
                scheduleByIdStub = sinon.stub(ScheduleService, "getScheduleById");
                appointmentStub = sinon.stub(db.Appointments, "findOne");
                createStub = sinon.stub(db.Appointments, "create");
            });
            it("expect throw an Error('Patient not found'), when patient not found for user", async () => {
                const appointment = { doctor_id: 1, user_id: 1, clinic_id: 1, schedule_id: 1 };
                doctorByIdStub.resolves({ id: 1 });
                clinicByIdStub.resolves({ id: 1 });
                userByIdStub.resolves({ getPatients: () => null });

                await expect(AppointmentService.createAppointment(appointment)).to.be.rejectedWith(Error, "Patient not found");

                expect(doctorByIdStub.calledOnceWith(1)).to.be.true;
                expect(clinicByIdStub.calledOnceWith(1)).to.be.true;
                expect(userByIdStub.calledOnceWith(1)).to.be.true;
                expect(createStub.called).to.be.false;
            });
            it("expect throw an Error('Invalid or unavailable time slot'), when slots found", async () => {
                const appointment = { doctor_id: 1, user_id: 1, clinic_id: 1, schedule_id: 1, time: "08:00" };
                const schedule = { start_time: "09:00", end_time: "17:00", interval: 30 };
                doctorByIdStub.resolves({ id: 1 });
                clinicByIdStub.resolves({ id: 1 });
                userByIdStub.resolves({ getPatients: () => true });
                scheduleByIdStub.resolves(schedule);

                await expect(AppointmentService.createAppointment(appointment)).to.be.rejectedWith(Error, "Invalid or unavailable time slot");

                expect(doctorByIdStub.calledOnceWith(1)).to.be.true;
                expect(clinicByIdStub.calledOnceWith(1)).to.be.true;
                expect(userByIdStub.calledOnceWith(1)).to.be.true;
                expect(createStub.called).to.be.false;
            });
            it("expect throw an Error('Appointment already exists'), when appointment exists", async () => {
                const appointment = { doctor_id: 1, user_id: 1, clinic_id: 1, schedule_id: 1, time: "09:00" };
                const schedule = { start_time: "09:00", end_time: "17:00", interval: 30 };
                doctorByIdStub.resolves({ id: 1 });
                clinicByIdStub.resolves({ id: 1 });
                userByIdStub.resolves({ getPatients: () => ({ id: 2 }) });
                scheduleByIdStub.resolves(schedule);
                appointmentStub.resolves({ id: 1 });

                await expect(AppointmentService.createAppointment(appointment)).to.be.rejectedWith(Error, "Appointment already exists");

                expect(doctorByIdStub.calledOnceWith(1)).to.be.true;
                expect(clinicByIdStub.calledOnceWith(1)).to.be.true;
                expect(userByIdStub.calledOnceWith(1)).to.be.true;
                expect(createStub.called).to.be.false;
            });
        });
        describe("getAppointmentById() =>:", () => {
            let findByPkStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Appointments, "findByPk");
            });
            it("expect throws Error('Appointment not found'), when it isn't", async () => {
                findByPkStub.resolves(false);

                await expect(AppointmentService.getAppointmentById(1)).to.be.rejectedWith(Error, "Appointment not found");

                expect(findByPkStub.calledOnceWith(1, { include: [db.Doctors, db.Clinics, db.Patients, db.Schedules] })).to.be.true;
            });
            it("expect throws Error('Appointment error'), when it isn't", async () => {
                findByPkStub.rejects(new Error("Appointment error"));

                await expect(AppointmentService.getAppointmentById(1)).to.be.rejectedWith(Error, "Appointment error");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
        });
        describe("updateSchedule() =>:", () => {
            let updateStub, findByPkStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Appointments, "findByPk");
                updateStub = sinon.stub();
            });
            it("expect throw error('Appointment not found'), when it isn't", async () => {
                const appointment = { id: 1, date: "2024-10-22", start_time: "10:00", end_time: "11:00" };
                findByPkStub.resolves(false);

                await expect(AppointmentService.updateAppointment(1, appointment)).to.be.rejectedWith(Error, "Appointment not found");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
            it("expect throw error('Appointment error'), when error db", async () => {
                const appointment = { id: 1, date: "2024-10-22", start_time: "10:00", end_time: "11:00" };
                findByPkStub.resolves({ update: updateStub });
                updateStub.rejects(new Error("Appointment error"));

                await expect(AppointmentService.updateAppointment(1, appointment)).to.be.rejectedWith(Error, "Appointment error");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
        });
        describe("deleteSpecialty() =>:", () => {
            let destroyStub, findByPkStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Appointments, "findByPk");
                destroyStub = sinon.stub();
            });
            it("expect throw error('Appointments not found'), when it isn't", async () => {
                findByPkStub.resolves(false);

                await expect(AppointmentService.deleteAppointment(1)).to.be.rejectedWith(Error, "Appointment not found");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
            it("expect throw error('Appointments error'), when error db", async () => {
                findByPkStub.resolves({ destroy: destroyStub });
                destroyStub.rejects(new Error("Appointments error"));

                await expect(AppointmentService.deleteAppointment(1)).to.be.rejectedWith(Error, "Appointments error");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
        });
    });
});