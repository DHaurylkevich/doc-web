require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const db = require("../../../src/models");
const sequelize = require("../../../src/config/db");
const UserService = require("../../../src/services/userService");
const PatientService = require("../../../src/services/patientService");
const tokenUtil = require("../../../src/middleware/auth");

use(chaiAsPromised);

describe("Patient Service", () => {
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive tests", () => {
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
            });
            it("expect user and patient to be created with transaction and return token", async () => {
                const newUser = { id: 1, data: "foo" };
                const newPatient = { gender: "foo", market_inf: true };
                const newAddress = { city: "foo", street: "foo", home: 1, flat: 1, post_index: "123-1234" };
                createUserServiceStub.resolves({ newUser, createPatients: createPatientStub });
                createPatientStub.resolves({ ...newPatient, id: 1, createAddress: sinon.stub().resolves() });
                createJWTStub.resolves("fake-JWT-Token");

                const result = await PatientService.createPatient(newUser, newPatient, newAddress);

                expect(createUserServiceStub.calledOnceWith(newUser, sinon.match.any)).to.be.true;
                expect(createPatientStub.calledOnceWith(newPatient, { transaction: sinon.match.any })).to.be.true;
                expect(transactionStub.commit.calledOnce).to.be.true;
                expect(result).to.equals("fake-JWT-Token");
            });
        });
        // describe("updatePatient() => Update:", () => {
        //     let transactionStub, updateUserStub, getPatientsStub, updatePatientStub, getAddressesStub, updateAddressStub;

        //     beforeEach(async () => {
        //         transactionStub = {
        //             commit: sinon.stub(),
        //             rollback: sinon.stub(),
        //         };
        //         sinon.stub(sequelize, "transaction").resolves(transactionStub);
        //         updateUserStub = sinon.stub(UserService, "updateUser");
        //         getPatientsStub = sinon.stub();
        //         updatePatientStub = sinon.stub();
        //         getAddressesStub = sinon.stub();
        //         updateAddressStub = sinon.stub(AddressService, "updateAddress");
        //     });
        //     it("expect update user, patient, address successfully", async () => {
        //         const id = 1;
        //         const userData = { email: "FOO" };
        //         const patientData = { gender: "FOO" };
        //         const addressData = { city: "FOO" };
        //         const foundUser = { getPatients: getPatientsStub }
        //         const foundPatient = { update: updatePatientStub, getAddresses: () => getAddressesStub() };
        //         updateUserStub.resolves(foundUser);
        //         getPatientsStub.resolves(foundPatient);
        //         updatePatientStub.resolves();
        //         getAddressesStub.resolves(2);
        //         updateAddressStub.resolves();

        //         await PatientService.updatePatient(id, userData, patientData, addressData);

        //         expect(updateUserStub.calledOnceWith(id, userData, transactionStub)).to.be.true;
        //         expect(getPatientsStub.calledOnce).to.be.true;
        //         expect(updatePatientStub.calledOnceWith(patientData, { transaction: transactionStub })).to.be.true;
        //         expect(getAddressesStub.calledOnce).to.be.true;
        //         expect(updateAddressStub.calledOnceWith(2, addressData, transactionStub)).to.be.true;
        //         expect(transactionStub.commit.calledOnce).to.be.true;
        //     });
        // });
    });
    describe("Error tests", () => {
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
                updateUserStub.resolves({ getPatients: getPatientsStub })
                getPatientsStub.resolves(false);

                await expect(PatientService.updatePatient(id, userData, patientData, addressData)).to.be.rejectedWith(Error, "Patient not found");

                expect(updateUserStub.calledOnceWith(id, userData, transactionStub)).to.be.true;
                expect(getPatientsStub.calledOnce).to.be.true;
                expect(updatePatientStub.calledOnce).to.be.false;
            });
        });
    });
});