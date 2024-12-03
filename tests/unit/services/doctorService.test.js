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
const AppError = require("../../../src/utils/appError");
const { Op } = require("sequelize");

use(chaiAsPromised);

describe("Doctor Service", () => {
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive test", () => {
        let transactionStub, getClinicByIdStub, findOneUserStub, createUserStub, createDoctorStub, setServicesStub;
        describe("createDoctor() =>:", () => {
            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                getClinicByIdStub = sinon.stub(ClinicService, "getClinicById");
                findOneUserStub = sinon.stub(db.Users, "findOne");
                createUserStub = sinon.stub(db.Users, "create");
                createDoctorStub = sinon.stub();
                createDoctorStub = sinon.stub();
                setServicesStub = sinon.stub();
            });

            it("expect successfully create a doctor, when data valid", async () => {
                const userData = { name: 'John Doe', };
                const specialtyId = 2;
                const servicesIds = [2];
                const clinicId = 1;
                const doctorData = { name: "Doctor Name" };
                const newDoctor = { clinic_id: 1, ...doctorData };

                getClinicByIdStub.resolves();
                findOneUserStub.resolves();
                createUserStub.resolves({ newDoctor, createDoctor: createDoctorStub });
                createDoctorStub.resolves({ setServices: setServicesStub });

                await DoctorService.createDoctor({ userData, doctorData, specialtyId, servicesIds, clinicId });

                expect(getClinicByIdStub.calledOnceWith(clinicId)).to.be.true;
                expect(findOneUserStub.calledOnceWith(
                    {
                        where: { [Op.or]: userData }
                    },
                    { transaction: transactionStub }
                )).to.be.true;
                expect(createDoctorStub.calledOnceWith(
                    { clinic_id: clinicId, ...doctorData, specialty_id: specialtyId },
                    { transaction: transactionStub }
                )).to.be.true;
                expect(setServicesStub.calledOnceWith(servicesIds)).to.be.true;
                expect(transactionStub.commit.calledOnce).to.be.true;
                expect(transactionStub.rollback.called).to.be.false;
            });
        });
        describe("getDoctorById() =>:", () => {
            let findOneStub;

            beforeEach(async () => {
                findOneStub = sinon.stub(db.Doctors, "findOne");
            })
            it("expect get doctor by id, when it is in db", async () => {
                const mockDoctor = {
                    id: 1,
                    user: {
                        id: 1,
                        first_name: 'John',
                        last_name: 'Doe',
                        address: {
                            city: 'New York'
                        }
                    },
                    specialty: {
                        id: 1,
                        name: 'Cardiology'
                    },
                    clinic: {
                        name: 'City Hospital'
                    }
                };
                findOneStub.resolves(mockDoctor);

                const result = await DoctorService.getDoctorById(1);

                expect(findOneStub.calledOnce).to.be.true;
                expect(result).to.deep.equal(mockDoctor);
            });
        });
        describe("updateDoctorById() => :", () => {
            let getDoctorStub, updateDoctorStub, updateUserStub, transactionStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                updateUserStub = sinon.stub(UserService, "updateUser");
                getDoctorStub = sinon.stub();
                getAddressStub = sinon.stub();
                updateAddressStub = sinon.stub();
                updateDoctorStub = sinon.stub();
                setServicesStub = sinon.stub();
            })
            it("expect update user data, when is valid data'", async () => {
                const userId = 1;
                const userData = "user data";
                const addressData = "address data";
                const doctorData = "doctor data";
                const servicesIds = [1];
                updateUserStub.resolves({ getDoctor: getDoctorStub, getAddress: getAddressStub });
                getDoctorStub.resolves({ update: updateDoctorStub, setServices: setServicesStub });
                getAddressStub.resolves({ update: updateAddressStub });
                updateDoctorStub.resolves(doctor = "updatedDoctor");

                await DoctorService.updateDoctorById({ userId, userData, addressData, doctorData, servicesIds });

                expect(sequelize.transaction.calledOnce).to.be.true;
                expect(updateUserStub.calledOnceWith(userId, userData, transactionStub)).to.be.true;
                expect(getDoctorStub.calledOnce).to.be.true;
                expect(updateDoctorStub.calledOnceWith(doctorData, { transaction: transactionStub })).to.be.true;
                expect(setServicesStub.calledOnceWith(servicesIds, { transaction: transactionStub })).to.be.true;
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
            let findOneStub;

            beforeEach(async () => {
                findOneStub = sinon.stub(db.Doctors, "findOne");
            })
            it('expect throw AppError when doctor is not found', async () => {
                findOneStub.resolves(null);

                try {
                    await DoctorService.getDoctorById(1);
                    expect.fail('Expected an error to be thrown');
                } catch (error) {
                    expect(error).to.be.instanceOf(AppError);
                    expect(error.message).to.equal('Doctor not found');
                    expect(error.statusCode).to.equal(404);
                }
            });

            it('expect throw an error when database query fails', async () => {
                const dbError = new Error('Database error');
                findOneStub.rejects(dbError);

                try {
                    await DoctorService.getDoctorById(1);
                    expect.fail('Expected an error to be thrown');
                } catch (error) {
                    expect(error).to.equal(dbError);
                }
            });
        });
        describe("updateDoctor() => :", () => {
            let userId, userData, addressData, doctorData, servicesIds, getDoctorStub, updateDoctorStub, getAddressStub, updateUserStub, transactionStub;

            beforeEach(async () => {
                userId = 1;
                userData = "user data";
                addressData = "address data";
                doctorData = "doctor data";
                servicesIds = [1];
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                updateUserStub = sinon.stub(UserService, "updateUser");
                getDoctorStub = sinon.stub();
                getAddressStub = sinon.stub();
                updateDoctorStub = sinon.stub();
            })
            it("expect throw AppError('Update User error') and transaction to rollback", async () => {
                updateUserStub.throws(new AppError("Update User error"));

                await expect(DoctorService.updateDoctorById({ userId, userData, addressData, doctorData, servicesIds })).to.be.rejectedWith("Update User error");

                expect(updateUserStub.calledOnceWith(userId, userData, transactionStub)).to.be.true;
                expect(getDoctorStub.calledOnce).to.be.false;
            });
            it("expect throw error('Doctor not found') and transaction to rollback", async () => {
                updateUserStub.resolves({ getDoctor: getDoctorStub, getAddress: getAddressStub });
                getAddressStub.resolves({ update: updateDoctorStub });
                getDoctorStub.resolves(null);


                await expect(DoctorService.updateDoctorById({ userId, userData, addressData, doctorData, servicesIds })).to.be.rejectedWith("Doctor not found");

                expect(updateUserStub.calledOnceWith(userId, userData, transactionStub)).to.be.true;
                expect(getDoctorStub.calledOnce).to.be.true;
            });
            it("expect throw error('Update error') and transaction to rollback", async () => {
                updateUserStub.resolves({ getAddress: getAddressStub, getDoctor: getDoctorStub });
                getAddressStub.rejects(new Error("Update error"))

                await expect(DoctorService.updateDoctorById({ userId, userData, addressData, doctorData, servicesIds })).to.be.rejectedWith("Update error");

                expect(updateUserStub.calledOnceWith(userId, userData, transactionStub)).to.be.true;
                expect(getDoctorStub.calledOnce).to.be.false;
            });
        });
    });
});