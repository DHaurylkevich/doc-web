require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const db = require("../../../src/models");
const ScheduleService = require("../../../src/services/scheduleService");
const DoctorService = require("../../../src/services/doctorService");
const ClinicService = require("../../../src/services/clinicService");

use(chaiAsPromised);

describe("Schedule Service", () => {
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive tests", () => {
        describe("createSchedule() =>:", () => {
            let createStub, getDoctorByIdStub, getClinicByIdStub, findOneStub;

            beforeEach(async () => {
                getDoctorByIdStub = sinon.stub(DoctorService, "getDoctorById");
                getClinicByIdStub = sinon.stub(ClinicService, "getClinicById");
                findOneStub = sinon.stub(db.Schedules, "findOne");
                createStub = sinon.stub(db.Schedules, "create");
            });
            it("expect create specialty when valid data", async () => {
                const schedule = { clinic_id: 1, doctor_id: 2, interval: 30, date: "22.10.2024", start_time: "10:00", end_time: "11:00" }
                createStub.resolves(schedule);
                findOneStub.resolves(false);

                const result = await ScheduleService.createSchedule(schedule);

                expect(getDoctorByIdStub.calledOnceWith(2)).to.be.true;
                expect(getClinicByIdStub.calledOnceWith(1)).to.be.true;
                expect(createStub.calledOnceWith({ doctor_id: 2, clinic_id: 1, date: "22.10.2024", start_time: "10:00", end_time: "11:00" })).to.be.true;
                expect(result).to.deep.equals(schedule);
            });
        });
        describe("getScheduleById() =>:", () => {
            let findByPkStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Schedules, "findByPk");
            });
            it("expect return specialty by id, when it is", async () => {
                const schedule = { id: 1, name: "Psychiatra" };
                findByPkStub.resolves(schedule);

                const result = await ScheduleService.getScheduleById(1);

                expect(findByPkStub.calledOnceWith(1, { include: [db.Doctors, db.Clinics] })).to.be.true;
                expect(result).to.deep.equals(schedule);
            });
        });
        describe("updateSchedule() =>:", () => {
            let updateStub, findByPkStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Schedules, "findByPk");
                updateStub = sinon.stub();
            });
            it("expect update schedule, when valid data", async () => {
                const scheduleData = { id: 1, date: "2024-10-22", start_time: "10:00", end_time: "11:00" };
                findByPkStub.resolves({ update: updateStub });
                updateStub.resolves(scheduleData);

                const result = await ScheduleService.updateSchedule(1, scheduleData);

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(updateStub.calledOnceWith(scheduleData)).to.be.true;
                expect(result).to.deep.equal(scheduleData);
            });
        });
        describe("deleteSchedule() =>:", () => {
            let destroyStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Schedules, "findByPk");
                destroyStub = sinon.stub();
            });
            it("expect delete schedule when valid data", async () => {
                findByPkStub.resolves({ destroy: destroyStub });
                destroyStub.resolves();

                await ScheduleService.deleteSchedule(1);

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(destroyStub.calledOnce).to.be.true;
            });
        });
        describe("getScheduleByDoctor() =>:", () => {
            let findAllStub;

            beforeEach(async () => {
                findAllStub = sinon.stub(db.Schedules, "findAll");
            });
            it("expect return schedule by doctor_id, when it is", async () => {
                const schedule = { id: 1, name: "Psychiatra" };
                findAllStub.resolves(schedule);

                const result = await ScheduleService.getScheduleByDoctor(1);

                expect(findAllStub.calledOnceWith({ where: { doctor_id: 1 } })).to.be.true;
                expect(result).to.deep.equals(schedule);
            });
        });
        describe("getScheduleByClinic() =>:", () => {
            let findAllStub;

            beforeEach(async () => {
                findAllStub = sinon.stub(db.Schedules, "findAll");
            });
            it("expect return schedule by doctor_id, when it is", async () => {
                const schedule = { id: 1, name: "Psychiatra" };
                findAllStub.resolves(schedule);

                const result = await ScheduleService.getScheduleByClinic(1);

                expect(findAllStub.calledOnceWith({
                    where: { clinic_id: 1 }, include: [db.Doctors]
                })).to.be.true;
                expect(result).to.deep.equals(schedule);
            });
        });
    });
    describe("Negative tests", () => {
        describe("createSpecialty () =>:", () => {
            let createStub, getDoctorByIdStub, getClinicByIdStub, findOneStub;

            beforeEach(async () => {
                getDoctorByIdStub = sinon.stub(DoctorService, "getDoctorById");
                getClinicByIdStub = sinon.stub(ClinicService, "getClinicById");
                findOneStub = sinon.stub(db.Schedules, "findOne");
                createStub = sinon.stub(db.Schedules, "create");
            });
            it("expect error('Doctor not found'), when isn't in db", async () => {
                const schedule = { clinic_id: 1, doctor_id: 2, interval: 30, date: "22.10.2024", start_time: "10:00", end_time: "11:00" }
                getDoctorByIdStub.rejects(new Error("Doctor not found"));

                await expect(ScheduleService.createSchedule(schedule)).to.be.rejectedWith(Error, "Doctor not found");

                expect(getDoctorByIdStub.calledOnceWith(2)).to.be.true;
                expect(getClinicByIdStub.calledOnceWith(1)).to.be.false;
                expect(createStub.calledOnce).to.be.false;
            });
            it("expect error('Clinic not found'), when isn't in db", async () => {
                const schedule = { clinic_id: 1, doctor_id: 2, interval: 30, date: "22.10.2024", start_time: "10:00", end_time: "11:00" }
                getClinicByIdStub.rejects(new Error("Clinic not found"));

                await expect(ScheduleService.createSchedule(schedule)).to.be.rejectedWith(Error, "Clinic not found");

                expect(getDoctorByIdStub.calledOnceWith(2)).to.be.true;
                expect(getClinicByIdStub.calledOnceWith(1)).to.be.true;
                expect(createStub.calledOnce).to.be.false;
            });
            it("expect error('Schedule is exist'), when isn't in db", async () => {
                const schedule = { clinic_id: 1, doctor_id: 2, interval: 30, date: "22.10.2024", start_time: "10:00", end_time: "11:00" }
                findOneStub.resolves(true);

                await expect(ScheduleService.createSchedule(schedule)).to.be.rejectedWith(Error, "Schedule is exist");

                expect(getDoctorByIdStub.calledOnceWith(2)).to.be.true;
                expect(getClinicByIdStub.calledOnceWith(1)).to.be.true;
                expect(createStub.calledOnce).to.be.false;
            });
            it("expect error('Schedules error'), when isn't in db", async () => {
                const schedule = { clinic_id: 1, doctor_id: 2, interval: 30, date: "22.10.2024", start_time: "10:00", end_time: "11:00" }
                createStub.rejects(new Error("Schedules error"));

                await expect(ScheduleService.createSchedule(schedule)).to.be.rejectedWith(Error, "Schedules error");

                expect(getDoctorByIdStub.calledOnceWith(2)).to.be.true;
                expect(getClinicByIdStub.calledOnceWith(1)).to.be.true;
                expect(createStub.calledOnce).to.be.true;
            });
        });
        describe("getSchedulesById() =>:", () => {
            let findByPkStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Schedules, "findByPk");
            });
            it("expect throws Error('Schedule not found'), when it isn't", async () => {
                findByPkStub.resolves(false);

                await expect(ScheduleService.getScheduleById(1)).to.be.rejectedWith(Error, "Schedule not found");

                expect(findByPkStub.calledOnceWith(1, { include: [db.Doctors, db.Clinics] })).to.be.true;
            });
            it("expect throws Error('Schedules error'), when it isn't", async () => {
                findByPkStub.rejects(new Error("Schedules error"));

                await expect(ScheduleService.getScheduleById(1)).to.be.rejectedWith(Error, "Schedules error");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
        });
        describe("updateSchedule() =>:", () => {
            let updateStub, findByPkStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Schedules, "findByPk");
                updateStub = sinon.stub();
            });
            it("expect throw error('Schedule not found'), when it isn't", async () => {
                const scheduleData = { id: 1, date: "2024-10-22", start_time: "10:00", end_time: "11:00" };
                findByPkStub.resolves(false);

                await expect(ScheduleService.updateSchedule(1, scheduleData)).to.be.rejectedWith(Error, "Schedule not found");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
            it("expect throw error('Schedule error'), when error db", async () => {
                const scheduleData = { id: 1, date: "2024-10-22", start_time: "10:00", end_time: "11:00" };
                findByPkStub.resolves({ update: updateStub });
                updateStub.rejects(new Error("Schedule error"));

                await expect(ScheduleService.updateSchedule(1, scheduleData)).to.be.rejectedWith(Error, "Schedule error");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
        });
        describe("deleteSpecialty() =>:", () => {
            let destroyStub, findByPkStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Schedules, "findByPk");
                destroyStub = sinon.stub();
            });
            it("expect throw error('Schedule not found'), when it isn't", async () => {
                findByPkStub.resolves(false);

                await expect(ScheduleService.deleteSchedule(1)).to.be.rejectedWith(Error, "Schedule not found");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
            it("expect throw error('Schedules error'), when error db", async () => {
                findByPkStub.resolves({ destroy: destroyStub });
                destroyStub.rejects(new Error("Schedules error"));

                await expect(ScheduleService.deleteSchedule(1)).to.be.rejectedWith(Error, "Schedules error");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
        });
        describe("getScheduleByClinic() =>:", () => {
            let findAllStub;

            beforeEach(async () => {
                findAllStub = sinon.stub(db.Schedules, "findAll");
            });

            it("expect throws Error('Schedules error'), when it isn't", async () => {
                findAllStub.rejects(new Error("Schedules error"));

                await expect(ScheduleService.getScheduleByClinic(1)).to.be.rejectedWith(Error, "Schedules error");

                expect(findAllStub.calledOnceWith({ where: { clinic_id: 1 }, include: [db.Doctors] })).to.be.true;
            });
        });
        describe("getScheduleByDoctor() =>:", () => {
            let findAllStub;

            beforeEach(async () => {
                findAllStub = sinon.stub(db.Schedules, "findAll");
            });

            it("expect throws Error('Schedules error'), when it isn't", async () => {
                findAllStub.rejects(new Error("Schedules error"));

                await expect(ScheduleService.getScheduleByDoctor(1)).to.be.rejectedWith(Error, "Schedules error");

                expect(findAllStub.calledOnceWith({ where: { doctor_id: 1 } })).to.be.true;
            });
        });
    });
});