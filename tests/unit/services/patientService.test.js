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
    describe("Positive tests", () => {
        afterEach(async () => {
            sinon.restore();
        });
        describe("registrationPatient() => Registration:", () => {
            let transactionStub, createUserServiceStub, createPatientStub, createAddressServiceStub, createJWTStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                createUserServiceStub = sinon.stub(UserService, "createUser");
                createAddressServiceStub = sinon.stub(AddressService, "createAddress");
                createPatientStub = sinon.stub(db.Patients, "create");
                createJWTStub = sinon.stub(tokenUtil, "createJWT");
            });

            afterEach(async () => {
                sinon.restore();
            });

            it("expect user and patient to be created with transaction and return token", async () => {
                const newUser = { id: 1, data: "foo" };
                const newPatient = { gender: "foo", market_inf: true };
                const newAddress = { city: "foo", street: "foo", home: 1, flat: 1, post_index: "123-1234" };
                createUserServiceStub.resolves(newUser);
                createAddressServiceStub.resolves({ ...newAddress, id: 1 });
                createPatientStub.resolves({ ...newPatient, id: 1 });
                createJWTStub.resolves("fake-JWT-Token");

                const result = await PatientService.registerPatient(newUser, newPatient, newAddress);

                expect(createUserServiceStub.calledOnceWith(newUser)).to.be.true;
                expect(createAddressServiceStub.calledOnceWith(newAddress)).to.be.true;
                expect(createPatientStub.calledOnceWith(
                    { ...newPatient, user_id: newUser.id, address_id: 1 },
                    { transaction: sinon.match.any }
                )).to.be.true;
                expect(transactionStub.commit.calledOnce).to.be.true;
                expect(result).to.equals("fake-JWT-Token");
            });
        });
        describe("updatePatient() => Update:", () => {
            let findByPkPatientStub, updatePatientStub, transactionStub, updateUserServiceStub, updateAddressServiceStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                findByPkPatientStub = sinon.stub(db.Patients, "findByPk");
                updateUserServiceStub = sinon.stub(UserService, "updateUser");
                updateAddressServiceStub = sinon.stub(AddressService, "updateAddress");
                updatePatientStub = sinon.stub(db.Patients, "update");
            });
            afterEach(async () => {
                sinon.restore();
            });
            it("when user is in DB and has a valid data, expect to update user and get updated user data successfully", async () => {
                const id = 1;
                const userData = { email: "FOO" };
                const patientData = { gender: "FOO" };
                const addressData = { city: "FOO" };
                const foundPatient = { id, user_id: 2, address_id: 3, update: updatePatientStub };
                findByPkPatientStub.resolves(foundPatient);
                updateUserServiceStub.resolves();
                updateAddressServiceStub.resolves();
                updatePatientStub.resolves({ id, ...userData });

                await PatientService.updatePatient(id, userData, patientData, addressData);

                expect(findByPkPatientStub.calledOnceWith(id)).to.be.true;
                expect(updateUserServiceStub.calledOnceWith(foundPatient.user_id, userData, transactionStub)).to.be.true;
                expect(updateAddressServiceStub.calledOnceWith(foundPatient.address_id, addressData, transactionStub)).to.be.true;
                expect(updatePatientStub.calledOnceWith(patientData, transactionStub)).to.be.true;
                expect(transactionStub.commit.calledOnce).to.be.true;
            });
        });
    });
    describe("Error tests", () => {
        afterEach(async () => {
            sinon.restore();
        });
        describe("registrationPatient() => Registration:", () => {
            let transactionStub, createUserServiceStub, createPatientStub, createAddressServiceStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                createUserServiceStub = sinon.stub(UserService, "createUser");
                createAddressServiceStub = sinon.stub(AddressService, "createAddress");
                createPatientStub = sinon.stub(db.Patients, "create");
            });

            it("expect transaction to rollback if error occurs and throw Error 'Create user failed'", async () => {
                const newUser = "ERROR";
                const newAddress = "FOO";
                const newPatient = "FOO"
                createUserServiceStub.rejects(new Error("Create user failed"));

                await expect(PatientService.registerPatient(newUser, newPatient, newAddress)).to.be.rejectedWith(Error, "Create user failed");

                expect(transactionStub.rollback.calledOnce).to.be.true;
                expect(createPatientStub.calledOnce).to.be.false;
                expect(createAddressServiceStub.calledOnce).to.be.false;
            });
            it("expect transaction to rollback if error occurs and throw Error 'Create address failed'", async () => {
                const newUser = { id: 1, data: "foo" };
                const newAddress = "ERROR";
                const newPatient = "FOO";
                createUserServiceStub.resolves(newUser);
                createAddressServiceStub.rejects(new Error("Create address failed"));

                await expect(PatientService.registerPatient(newUser, newPatient, newAddress)).to.be.rejectedWith(Error, "Create address failed");
                expect(transactionStub.rollback.calledOnce).to.be.true;
                expect(createUserServiceStub.calledOnceWith(newUser)).to.be.true;
                expect(createPatientStub.calledOnce).to.be.false;
            });
            it("expect transaction to rollback if error occurs and throw Error 'Create address failed'", async () => {
                const newUser = { id: 1, data: "foo" };
                const newAddress = { city: "foo", street: "foo", home: 1, flat: 1, post_index: "123-1234" };
                const newPatient = { gender: "foo", market_inf: true };
                createAddressServiceStub.resolves({ ...newAddress, id: 1 });
                createUserServiceStub.resolves(newUser);
                createPatientStub.rejects(new Error("Create patient failed"));

                await expect(PatientService.registerPatient(newUser, newPatient, newAddress)).to.be.rejectedWith(Error, "Create patient failed");
                expect(transactionStub.rollback.calledOnce).to.be.true;
            });
        });
        describe("updatePatient() => Update:", () => {
            let findByPkPatientStub, updatePatientStub, transactionStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                findByPkPatientStub = sinon.stub(db.Patients, "findByPk");
                updatePatientStub = sinon.stub(db.Patients, "update");
            })
            it("expect transaction to rollback if error occurs and throw Error 'Patient not found'", async () => {
                const id = 1;
                const userData = { email: "FOO" };
                const patientData = { gender: "FOO" };
                const addressData = { city: "FOO" };
                findByPkPatientStub.resolves(false);

                await expect(PatientService.updatePatient(id, userData, patientData, addressData)).to.be.rejectedWith(Error, "Patient not found");

                expect(findByPkPatientStub.calledOnceWith(id)).to.be.true;
                expect(updatePatientStub.calledOnce).to.be.false;
            });
        });
    });
});