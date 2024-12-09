require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const PatientService = require("../../../src/services/patientService");
const PatientController = require("../../../src/controllers/patientController");
const AppError = require("../../../src/utils/appError");

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
            let createPatientStub;

            beforeEach(async () => {
                createPatientStub = sinon.stub(PatientService, "createPatient").resolves("fake-token");
            });
            it("expect create patient and return token", async () => {
                const userData = { name: "John Doe", email: "john@example.com" };
                const addressData = { street: "foo" };
                const req = { body: { userData, addressData } };

                await PatientController.registrationPatient(req, res, next);

                expect(createPatientStub.calledOnce).to.be.true;
                expect(createPatientStub.firstCall.args[0]).to.deep.equal(req.body.userData);
                expect(createPatientStub.firstCall.args[1]).to.deep.equal(req.body.addressData);
                expect(res.status.calledOnceWith(201)).to.be.true;
                expect(res.json.calledOnceWith("fake-token")).to.be.true;
                expect(next.called).to.be.false;
            });
        });
        describe("getPatientsFilter()", () => {
            let getPatientsByParamStub;
            beforeEach(async () => {
                getPatientsByParamStub = sinon.stub(PatientService, "getPatientsByParam");
            });
            it("expect handle missing query parameters for getPatientsFilter", async () => {
                const req = { query: {} };
                const expectedParams = { sort: 'asc', limit: 10, pages: 0, doctorId: undefined, clinicId: undefined };
                const fakePatients = [{ id: 1, name: 'John Doe' }];
                getPatientsByParamStub.resolves(fakePatients);

                await PatientController.getPatientsFilter(req, res, next);

                expect(getPatientsByParamStub.calledOnceWith(expectedParams)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith(fakePatients)).to.be.true;
                expect(next.called).to.be.false;
            });
            it("expect return array patients, when data is valid", async () => {
                const req = { query: {} };
                const expectedParams = { sort: 'asc', limit: 10, pages: 0, doctorId: undefined, clinicId: undefined };
                getPatientsByParamStub.resolves([{ id: 1, first_name: 'John' }, { id: 2, first_name: 'Jane' }]);

                await PatientController.getPatientsFilter(req, res, next);

                expect(getPatientsByParamStub.calledOnceWith(expectedParams)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith([{ id: 1, first_name: 'John' }, { id: 2, first_name: 'Jane' }])).to.be.true;
                expect(next.called).to.be.false;
            });
        });
        describe("getPatientsById()", () => {
            let getPatientsByParamStub;
            beforeEach(async () => {
                getPatientsByParamStub = sinon.stub(PatientService, "getPatientsByParam");
            });
            it("expect return user with 200, when user exists", async () => {
                const req = { params: { userId: 1 } };

                sinon.stub(PatientService, "getPatientById").resolves({ id: 1, first_name: "John" });

                await PatientController.getPatientById(req, res, next);

                expect(PatientService.getPatientById.calledOnceWith(1)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith({ id: 1, first_name: "John" })).to.be.true;
                expect(next.called).to.be.false;
            });
        });
        describe("updatePatientById()", () => {
            it("expect handle missing file for updatePatientById when req.file is undefined", async () => {
                const req = {
                    params: { userId: 1 },
                    body: {
                        userData: { name: "John Doe" },
                        addressData: { city: "New York" }
                    },
                    file: undefined
                };
                const updatedPatient = { id: 1, name: "John Doe" };
                sinon.stub(PatientService, "updatePatient").resolves(updatedPatient);

                await PatientController.updatePatientById(req, res, next);

                expect(PatientService.updatePatient.calledOnceWith(
                    null,
                    req.params.userId,
                    req.body.userData,
                    req.body.addressData
                )).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith(updatedPatient)).to.be.true;
                expect(next.called).to.be.false;
            });
            it("expect validate that image path is correctly passed to PatientService.updatePatient", async () => {
                const req = {
                    params: { userId: 1 },
                    body: {
                        userData: { name: "John Doe" },
                        addressData: { city: "New York" }
                    },
                    file: { path: "path/to/image.jpg" }
                };
                const updatedPatient = { id: 1, name: "John Doe", image: "path/to/image.jpg" };
                const updatePatientStub = sinon.stub(PatientService, "updatePatient").resolves(updatedPatient);

                await PatientController.updatePatientById(req, res, next);

                expect(updatePatientStub.calledOnceWith(
                    "path/to/image.jpg",
                    1,
                    req.body.userData,
                    req.body.addressData
                )).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith(updatedPatient)).to.be.true;
                expect(next.called).to.be.false;
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
        describe("getPatientsById()", () => {
            let getPatientsByParamStub;
            beforeEach(async () => {
                getPatientsByParamStub = sinon.stub(PatientService, "getPatientsByParam");
            });
            it("expect handle AppError 'Patient not found', when non-existent userId for getPatientById", async () => {
                const req = { params: { userId: 999 } };
                const error = new AppError("Patient not found");

                sinon.stub(PatientService, "getPatientById").rejects(error);

                await PatientController.getPatientById(req, res, next);

                expect(PatientService.getPatientById.calledOnceWith(999)).to.be.true;
                expect(next.calledOnceWith(error)).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            });
        });
        describe("updatePatientById()", () => {
            it("expect AppError 'Update error' patient data and return", async () => {
                const oldData = { userData: "foo", patientData: "foo", addressData: "foo" }
                const req = { params: { id: 1 }, body: oldData };
                const error = new AppError("Update error");
                sinon.stub(PatientService, "updatePatient").rejects(error);

                await PatientController.updatePatientById(req, res, next);

                expect(next.calledOnceWith(error)).to.be.true;
                expect(res.status.calledOnce).to.be.false;
                expect(res.json.calledOnce).to.be.false;
            });
        });
    });
});