require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const PatientService = require("../../../src/services/patientService");
const PatientController = require("../../../src/controllers/patientController");

use(chaiAsPromised);

describe("Patient Controller", () => {
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive test", () => {
        let res, next;
        beforeEach(async () => {
            res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            next = sinon.stub();
        });
        describe("registrationPatient()", () => {
            let createPatientServiceStub;

            beforeEach(async () => {
                createPatientServiceStub = sinon.stub(PatientService, "createPatient");
            });
            it("expect create patient and return token", async () => {
                const userData = { data: "foo" };
                const patientData = { gender: "foo" };
                const addressData = { street: "foo" };
                const req = { body: { userData, patientData, addressData } };
                createPatientServiceStub.resolves("fake-jwt-token");

                await PatientController.registrationPatient(req, res, next);

                expect(createPatientServiceStub.calledOnceWith(userData, patientData, addressData)).to.be.true;
                expect(res.status.calledOnceWith(201)).to.be.true;
                expect(res.json.calledOnceWith("fake-jwt-token")).to.be.true;
            });
        });
        describe("updatePatientById()", () => {
            it("expect update patient data and return", async () => {
                const oldData = { userData: "foo", patientData: "foo", addressData: "foo" }
                const req = { params: { id: 1 }, body: oldData};
                const newData = { userData: "New", patientData: "New", addressData: "New" }
                const updatePatientServiceStub = sinon.stub(PatientService, "updatePatient").resolves(newData);

                await PatientController.updatePatientById(req, res, next);

                expect(updatePatientServiceStub.calledOnceWith(1, req.body.userData, req.body.patientData, req.body.addressData)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith(newData)).to.be.true;
            });
        });
    });
    describe("Negative test", () => {
        let res, next;
        beforeEach(async () => {
            res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            next = sinon.stub();
        });

        describe("registrationPatient()", () => {
            let res, createPatientServiceStub, next;
            beforeEach(async () => {
                createPatientServiceStub = sinon.stub(PatientService, "createPatient");
                res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
                next = sinon.stub();
            });
            it("expect error('Create error')", async () => {
                const userData = { data: "foo" };
                const patientData = { gender: "foo" };
                const addressData = { street: "foo" };
                const req = { body: { userData, patientData, addressData } };
                const error = new Error("Create error");
                createPatientServiceStub.rejects(error);

                await PatientController.registrationPatient(req, res, next);

                expect(next.calledOnceWith(error)).to.be.true;
                expect(res.status.calledOnce).to.be.false;
                expect(res.json.calledOnce).to.be.false;
            });
        });
        describe("updatePatientById()", () => {
            it("expect error('Update error') patient data and return", async () => {
                const oldData = { userData: "foo", patientData: "foo", addressData: "foo" }
                const req = { params: { id: 1 }, body: oldData};
                const error = new Error("Update error");
                sinon.stub(PatientService, "updatePatient").rejects(error);

                await PatientController.updatePatientById(req, res, next);

                expect(next.calledOnceWith(error)).to.be.true;
                expect(res.status.calledOnce).to.be.false;
                expect(res.json.calledOnce).to.be.false;
            });
        });
    });
});