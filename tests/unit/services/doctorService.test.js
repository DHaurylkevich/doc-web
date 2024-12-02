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
        let transactionStub, findClinicStub, findSpecialtyStub, createUserStub, createDoctorStub, addSpecialtiesStub;
        describe("createDoctor() =>:", () => {
            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                findClinicStub = sinon.stub(ClinicService, "getClinicById").resolves();
                findSpecialtyStub = sinon.stub(SpecialtyService, "getSpecialtyById").resolves();
                createUserStub = sinon.stub(UserService, "createUser");
                createDoctorStub = sinon.stub();
                addSpecialtiesStub = sinon.stub();
            });

            it("expect successfully create a doctor, when data valid", async () => {
                const userData = { name: 'John Doe' };
                const specialtyIds = [2];
                const clinicId = 1;
                const doctorData = { name: "Doctor Name" };
                const newDoctor = { clinic_id: 1, ...doctorData };

                createUserStub.resolves({ createDoctor: createDoctorStub });
                createDoctorStub.resolves({ addSpecialties: addSpecialtiesStub });

                await DoctorService.createDoctor("user", doctorData, [2, 3], 1);

                expect(findClinicStub.calledOnceWith(1)).to.be.true;
                expect(findSpecialtyStub.calledTwice).to.be.true; // Теперь ожидаем, что вызов будет дважды
                expect(createUserStub.calledOnceWith("user", transactionStub)).to.be.true;
                expect(createDoctorStub.calledOnceWith(
                    { clinic_id: 1, ...doctorData },
                    { transaction: transactionStub }
                )).to.be.true;
                expect(addSpecialtiesStub.calledOnceWith([2, 3])).to.be.true; // Изменяем, чтобы ожидать оба ID
                expect(transactionStub.commit.calledOnce).to.be.true;
                expect(transactionStub.rollback.calledOnce).to.be.false;
            });
        });
        describe("getDoctorById() =>:", () => {
            let findByPkStub;
            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Doctors, "findByPk");
            })
            it("expect get doctor by id, when it is in db", async () => {
                const doctor = { id: 1, name: "House" };
                findByPkStub.resolves(doctor);

                const result = await DoctorService.getDoctorById(1);

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(result).to.deep.equal(doctor);
            });
        });
        describe("updateDoctor() => :", () => {
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
            it("expect update user data, when is valid data'", async () => {
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
        describe("createDoctor() =>:", () => {
            let transactionStub, findClinicStub, findSpecialtyStub, createUserStub, createDoctorStub, addSpecialtiesStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                findClinicStub = sinon.stub(ClinicService, "getClinicById").resolves();
                findSpecialtyStub = sinon.stub(SpecialtyService, "getSpecialtyById").resolves();
                createUserStub = sinon.stub(UserService, "createUser");
                createDoctorStub = sinon.stub();
                addSpecialtiesStub = sinon.stub();
            });
            it("Expect error('Clinic not found'), when createDoctor throws error", async () => {
                const error = new Error('Clinic not found');
                findClinicStub.throws(error);

                await expect(DoctorService.createDoctor("user", "doctor", [2], 1)).to.be.rejectedWith(error);

                expect(findClinicStub.calledOnceWith(1)).to.be.true;
                expect(findSpecialtyStub.calledOnce).to.be.false;
                expect(createUserStub.calledOnce).to.be.false;
                expect(transactionStub.commit.calledOnce).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
            });

            it("Expect error('Specialty not found'), when createDoctor throws error", async () => {
                const error = new Error('Specialty not found');
                findSpecialtyStub.throws(error);

                await expect(DoctorService.createDoctor("user", "doctor", [2], 1)).to.be.rejectedWith(error);

                expect(findClinicStub.calledOnceWith(1)).to.be.true;
                expect(findSpecialtyStub.calledOnceWith(2)).to.be.true;
                expect(createUserStub.calledOnce).to.be.false;
                expect(transactionStub.commit.calledOnce).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
            });

            it("Expect error('Create error'), when createUser throws error", async () => {
                const error = new Error("Create error");
                createUserStub.throws(error);

                await expect(DoctorService.createDoctor("user", "doctor", [2], 1)).to.be.rejectedWith(error);

                expect(findClinicStub.calledOnceWith(1)).to.be.true;
                expect(findSpecialtyStub.calledOnceWith(2)).to.be.true;
                expect(createUserStub.calledOnceWith("user", transactionStub)).to.be.true;
                expect(transactionStub.commit.calledOnce).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
            });

            it("Expect error('Create error'), when createDoctor throws error", async () => {
                const doctorData = { name: "Doctor Name" };
                const error = new Error("Create error");
                createUserStub.resolves({ createDoctor: createDoctorStub.rejects(error) });

                await expect(DoctorService.createDoctor("user", doctorData, [2], 1)).to.be.rejectedWith(error);

                expect(findClinicStub.calledOnceWith(1)).to.be.true;
                expect(findSpecialtyStub.calledOnceWith(2)).to.be.true;
                expect(createUserStub.calledOnceWith("user", transactionStub)).to.be.true;
                expect(createDoctorStub.calledOnceWith(
                    { clinic_id: 1, ...doctorData },
                    { transaction: transactionStub }
                )).to.be.true;
                expect(transactionStub.commit.calledOnce).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
            });
        });
        describe("getDoctorById() =>:", () => {
            let findByPkStub;
            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Doctors, "findByPk");
            })
            it("expect error('Doctor not found'), when it isn't in db", async () => {
                findByPkStub.resolves(false);

                await expect(DoctorService.getDoctorById(1)).to.be.rejectedWith(Error, "Doctor not found");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
            it("expect error('Doctor error'), when error db", async () => {
                findByPkStub.rejects(new Error("Doctor error"));

                await expect(DoctorService.getDoctorById(1)).to.be.rejectedWith(Error, "Doctor error");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
        });
        describe("updateDoctor() => :", () => {
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