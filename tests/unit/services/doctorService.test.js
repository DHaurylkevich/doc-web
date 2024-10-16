require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const db = require("../../../src/models");
const chaiAsPromised = require("chai-as-promised");
const sequelize = require("../../../src/config/db");
const DoctorService = require("../../../src/services/doctorService");
const ClinicService = require("../../../src/services/clinicService");
const SpecialtyService = require("../../../src/services/specialtyService");
const UserService = require("../../../src/services/userService");

use(chaiAsPromised);

describe("Doctor Service", () => {
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive test", () => {
        let transactionStub, findClinicStub, findSpecialtyStub, createUserStub, createDoctorStub;
        describe("createDoctorByClinic() =>:", () => {
            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                findClinicStub = sinon.stub(ClinicService, "findById");
                findSpecialtyStub = sinon.stub(SpecialtyService, "findById");
                createUserStub = sinon.stub(UserService, "createUser");
                createDoctorStub = sinon.stub();
            })
            it("Expect to create a doctor associated with the clinic and specialty", async () => {
                const doctorData = "doctor";
                const newDoctor = { specialty_id: 2, clinic_id: 1, name: doctorData };
                createUserStub.resolves({ createDoctor: createDoctorStub.resolves(newDoctor) });

                await DoctorService.createDoctorByClinic("user", doctorData, 2, 1);

                expect(findClinicStub.calledOnceWith(1)).to.be.true;
                expect(findSpecialtyStub.calledOnceWith(2)).to.be.true;
                expect(createUserStub.calledOnceWith("user", transactionStub)).to.be.true;
                expect(createDoctorStub.calledOnceWith(
                    { specialty_id: 2, clinic_id: 1, ...doctorData },
                    { transaction: transactionStub }
                )).to.be.true;
                expect(transactionStub.commit.calledOnce).to.be.true;
                expect(transactionStub.rollback.calledOnce).to.be.false;
            });
        });
        describe("updateDoctor() => Update:", () => {
            let getDoctorsStub, updateDoctorStub, updateUserStub, transactionStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                updateUserStub = sinon.stub(UserService, "updateUser");
                getDoctorsStub = sinon.stub();
                updateDoctorStub = sinon.stub(db.Doctors, "update");
            })
            it("expect update user data'", async () => {
                let doctor = "doctor";
                updateUserStub.resolves({ getDoctors: getDoctorsStub });
                getDoctorsStub.resolves({ update: updateDoctorStub });
                updateDoctorStub.resolves(doctor = "updatedDoctor");

                await DoctorService.updateDoctor(1, "user", doctor);

                expect(sequelize.transaction.calledOnce).to.be.true;
                expect(updateUserStub.calledOnceWith(1, "user", transactionStub)).to.be.true;
                expect(getDoctorsStub.calledOnce).to.be.true;
                expect(updateDoctorStub.calledOnceWith(doctor, { transaction: transactionStub })).to.be.true;
                expect(doctor).to.be.equal("updatedDoctor");
            });
        });
    });
    describe("Negative test", () => {
        describe("createDoctorByClinic() =>:", () => {
            let transactionStub, findClinicStub, findSpecialtyStub, createUserStub, createDoctorStub;
            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                findClinicStub = sinon.stub(ClinicService, "findById");
                findSpecialtyStub = sinon.stub(SpecialtyService, "findById");
                createUserStub = sinon.stub(UserService, "createUser");
                createDoctorStub = sinon.stub();
            })
            it("Expect error('Clinic not found'), when createDoctor throws error", async () => {
                const error = new Error('Clinic not found');
                findClinicStub.throws(error);

                await expect(DoctorService.createDoctorByClinic("user", "doctor", 2, 1)).to.be.rejectedWith(error);

                expect(findClinicStub.calledOnceWith(1)).to.be.true;
                expect(findSpecialtyStub.calledOnce).to.be.false;
                expect(createUserStub.calledOnce).to.be.false;
                expect(transactionStub.commit.calledOnce).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
            });
            it("Expect error('Specialty not found'), when createDoctor throws error", async () => {
                const error = new Error('Specialty not found');
                findSpecialtyStub.throws(error);

                await expect(DoctorService.createDoctorByClinic("user", "doctor", 2, 1)).to.be.rejectedWith(error);

                expect(findClinicStub.calledOnceWith(1)).to.be.true;
                expect(findSpecialtyStub.calledOnceWith(2)).to.be.true;
                expect(createUserStub.calledOnce).to.be.false;
                expect(transactionStub.commit.calledOnce).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
            });
            it("Expect error('Create error'), when createUser throws error", async () => {
                const error = new Error("Create error");
                createUserStub.throws(error);

                await expect(DoctorService.createDoctorByClinic("user", "doctor", 2, 1)).to.be.rejectedWith(error);

                expect(findClinicStub.calledOnceWith(1)).to.be.true;
                expect(findSpecialtyStub.calledOnceWith(2)).to.be.true;
                expect(createUserStub.calledOnceWith("user", transactionStub)).to.be.true;
                expect(transactionStub.commit.calledOnce).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
            });
            it("Expect error('Create error'), when createDoctor throws error", async () => {
                const doctorData = "doctor";
                const error = new Error("Create error");
                createUserStub.resolves({ createDoctor: createDoctorStub.rejects(error) });

                await expect(DoctorService.createDoctorByClinic("user", doctorData, 2, 1)).to.be.rejectedWith(error);

                expect(findClinicStub.calledOnceWith(1)).to.be.true;
                expect(findSpecialtyStub.calledOnceWith(2)).to.be.true;
                expect(createUserStub.calledOnceWith("user", transactionStub)).to.be.true;
                expect(createDoctorStub.calledOnceWith(
                    { specialty_id: 2, clinic_id: 1, ...doctorData },
                    { transaction: transactionStub }
                )).to.be.true;
                expect(transactionStub.commit.calledOnce).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
            });
        });
        describe("updateDoctor() => Update:", () => {
            let getDoctorsStub, updateDoctorStub, updateUserStub, transactionStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                updateUserStub = sinon.stub(UserService, "updateUser");
                getDoctorsStub = sinon.stub();
                updateDoctorStub = sinon.stub(db.Doctors, "update");
            })
            it("expect throw error('Update User error') and transaction to rollback", async () => {
                updateUserStub.throws(new Error("Update User error"));

                await expect(DoctorService.updateDoctor(1, "user", "doctor")).to.be.rejectedWith(Error, "Update User error");

                expect(updateUserStub.calledOnceWith(1, "user", transactionStub)).to.be.true;
                expect(getDoctorsStub.calledOnce).to.be.false;
                expect(updateDoctorStub.calledOnce).to.be.false;
            });
            it("expect throw error('Doctor not found') and transaction to rollback", async () => {
                updateUserStub.resolves({ getDoctors: getDoctorsStub })
                getDoctorsStub.resolves(false);

                await expect(DoctorService.updateDoctor(1, "user", "doctor")).to.be.rejectedWith(Error, "Doctor not found");

                expect(updateUserStub.calledOnceWith(1, "user", transactionStub)).to.be.true;
                expect(getDoctorsStub.calledOnce).to.be.true;
                expect(updateDoctorStub.calledOnce).to.be.false;
            });
            it("expect throw error('Update error') and transaction to rollback", async () => {
                updateUserStub.resolves({ getDoctors: getDoctorsStub })
                getDoctorsStub.resolves({ update: updateDoctorStub });
                updateDoctorStub.rejects(new Error("Update error"))

                await expect(DoctorService.updateDoctor(1, "user", "doctor")).to.be.rejectedWith(Error, "Update error");

                expect(updateUserStub.calledOnceWith(1, "user", transactionStub)).to.be.true;
                expect(getDoctorsStub.calledOnce).to.be.true;
                expect(updateDoctorStub.calledOnceWith("doctor", { transaction: transactionStub })).to.be.true;
            });
        });
    });
});