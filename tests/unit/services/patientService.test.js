require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const db = require("../../../src/models");
const sequelize = require("../../../src/config/db");
const UserService = require("../../../src/services/userService");
const PatientService = require("../../../src/services/patientService");
const AddressService = require("../../../src/services/addressService");
const tokenUtil = require("../../../src/middleware/auth");

use(chaiAsPromised);

describe("Patient Service", () => {
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive tests", () => {
        describe("createPatient() => Create:", () => {
            let transactionStub, createUserServiceStub, createPatientStub, createAddressStub, createJWTStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                createUserServiceStub = sinon.stub(UserService, "createUser");
                createPatientStub = sinon.stub(db.Patients, "create");
                createJWTStub = sinon.stub(tokenUtil, "createJWT");
                createAddressStub = sinon.stub();
            });
            it("expect user and patient to be created with transaction and return token", async () => {
                const newUser = { id: 1, data: "foo" };
                const newPatient = { gender: "foo", market_inf: true };
                const newAddress = { city: "foo", street: "foo", home: 1, flat: 1, post_index: "123-1234" };
                createUserServiceStub.resolves({ newUser, createPatient: createPatientStub });
                createPatientStub.resolves({ ...newPatient, id: 1, createAddress: createAddressStub });
                createAddressStub.resolves();
                createJWTStub.resolves("fake-JWT-Token");

                const result = await PatientService.createPatient(newUser, newPatient, newAddress);

                expect(createUserServiceStub.calledOnceWith(newUser, sinon.match.any)).to.be.true;
                expect(createPatientStub.calledOnceWith(newPatient, { transaction: sinon.match.any })).to.be.true;
                expect(createAddressStub.calledOnceWith(newAddress)).to.be.true;
                expect(transactionStub.commit.calledOnce).to.be.true;
                expect(result).to.equals("fake-JWT-Token");
            });
        });
        describe("getPatientById() => :", () => {
            it("expect patient, when it exists", async () => {
                const findByPkStub = sinon.stub(db.Patients, "findByPk").resolves({ id: 1, name: "Dimurik" });

                const result = await PatientService.getPatientById(1);

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(result).to.deep.equals({ id: 1, name: "Dimurik" });
            });
        });
        describe("updatePatient() => Update:", () => {
            let transactionStub, updateUserStub, getPatientsStub, updatePatientStub, getAddressesStub, updateAddressStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                updateUserStub = sinon.stub(UserService, "updateUser");
                getPatientsStub = sinon.stub();
                updateStub = sinon.stub();
                getAddressesStub = sinon.stub();
                updateAddressStub = sinon.stub(AddressService, "updateAddress");
            });
            it("expect update Patient and User, Address data successfully, when data is valid", async () => {
                updateUserStub.resolves({ getPatient: getPatientsStub });
                getPatientsStub.resolves({ update: updateStub, getAddress: getAddressesStub });
                updateStub.resolves();
                getAddressesStub.resolves({ id: 1, address: "foo" });
                updateAddressStub.resolves();

                await PatientService.updatePatient(1, "user", "patient", "address");

                expect(updateUserStub.calledOnceWith(1, "user", transactionStub)).to.be.true;
                expect(getPatientsStub.calledOnce).to.be.true;
                expect(updateStub.calledOnceWith("patient", { transaction: transactionStub })).to.be.true;
                expect(getAddressesStub.calledOnce).to.be.true;
                expect(updateAddressStub.calledOnceWith({ id: 1, address: "foo" }, "address", transactionStub)).to.be.true;
                expect(transactionStub.commit.calledOnce).to.be.true;
                expect(transactionStub.rollback.calledOnce).to.be.false;
            });
        });
    });
    describe("Error tests", () => {
        describe("createPatient() => Create:", () => {
            let transactionStub, createUserServiceStub, createPatientStub, createJWTStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                createUserServiceStub = sinon.stub(UserService, "createUser");
                createPatientStub = sinon.stub(db.Patients, "create");
                createJWTStub = sinon.stub(tokenUtil, "createJWT");
                createAddressStub = sinon.stub();
            });
            it("expect Error('User error'), when userService error", async () => {
                const newUser = { id: 1, data: "foo" };
                const newPatient = { gender: "foo", market_inf: true };
                const newAddress = { city: "foo", street: "foo", home: 1, flat: 1, post_index: "123-1234" };
                createUserServiceStub.rejects(new Error("User error"));

                await expect(PatientService.createPatient(newUser, newPatient, newAddress)).to.be.rejectedWith(Error, "User error");

                expect(createUserServiceStub.calledOnceWith(newUser, sinon.match.any)).to.be.true;
                expect(createPatientStub.calledOnce).to.be.false;
                expect(createAddressStub.calledOnce).to.be.false;
                expect(transactionStub.commit.calledOnce).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
            });
        });
        describe("updatePatient() => Update:", () => {
            let updatePatientStub, transactionStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                updateUserStub = sinon.stub(UserService, "updateUser");
                getPatientsStub = sinon.stub()
                updatePatientStub = sinon.stub(db.Patients, "update");
            })
            it("expect transaction to rollback if error occurs and throw Error 'Patient not found'", async () => {
                const id = 1;
                const userData = { email: "FOO" };
                const patientData = { gender: "FOO" };
                const addressData = { city: "FOO" };
                updateUserStub.resolves({ getPatient: getPatientsStub })
                getPatientsStub.resolves(false);

                await expect(PatientService.updatePatient(id, userData, patientData, addressData)).to.be.rejectedWith(Error, "Patient not found");

                expect(updateUserStub.calledOnceWith(id, userData, transactionStub)).to.be.true;
                expect(getPatientsStub.calledOnce).to.be.true;
                expect(updatePatientStub.calledOnce).to.be.false;
            });
        });
        describe("getPatientById() => :", () => {
            it("expect Error('Patient not found'), when it don't exists", async () => {
                const findByPkStub = sinon.stub(db.Patients, "findByPk").resolves(false);

                await expect(PatientService.getPatientById(1)).to.be.rejectedWith(Error, "Patient not found");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
        });
    });
});