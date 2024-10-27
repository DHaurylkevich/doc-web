require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const ClinicService = require("../../../src/services/clinicService");
const ClinicController = require("../../../src/controllers/clinicController");

use(chaiAsPromised);

describe("Clinic Controller", () => {
    let next, res;
    beforeEach(async () => {
        next = sinon.stub();
        res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    });
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive test", () => {
        describe("createClinic() =>:", () => {
            it("expect to create a clinic", async () => {
                const req = { body: { clinicData: "clinic", addressData: "address" } };
                const createClinicServiceStub = sinon.stub(ClinicService, "createClinic").resolves({ id: 1, ...req.body });

                await ClinicController.createClinic(req, res, next);

                expect(createClinicServiceStub.calledOnceWith("clinic", "address")).to.be.true;
                expect(res.status.calledOnceWith(201)).to.be.true;
                expect(res.json.calledOnceWith({ id: 1, ...req.body })).to.be.true;
            });
        });
        describe("updateClinicById() =>:", () => {
            it("expect to update a clinic associated with the clinic", async () => {
                const req = { params: { id: 1 }, body: { clinicData: "clinic", addressData: "address" } };
                const updateClinicServiceStub = sinon.stub(ClinicService, "updateClinic").resolves({ id: 1, clinicData: "clinicNew", addressData: "addressNew" });

                await ClinicController.updateClinicById(req, res, next);

                expect(updateClinicServiceStub.calledOnceWith(1, "clinic", "address")).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith({ id: 1, clinicData: "clinicNew", addressData: "addressNew" })).to.be.true;
            });
        });
        describe("getClinicById() =>:", () => {
            it("expect to update a clinic associated with the clinic", async () => {
                const req = { params: { id: 1 } };
                const getClinicServiceStub = sinon.stub(ClinicService, "getClinicById").resolves({ id: 1, clinicData: "clinic"});

                await ClinicController.getClinicById(req, res, next);

                expect(getClinicServiceStub.calledOnceWith(1)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith({ id: 1, clinicData: "clinic"})).to.be.true;
            });
        });
        describe("getFullClinicDataById() =>:", () => {
            it("expect to update a clinic associated with the clinic", async () => {
                const req = { params: { id: 1 } };
                const getFullClinicServiceStub = sinon.stub(ClinicService, "getFullClinicDataById").resolves({ id: 1, clinicData: "clinicNew", addressData: "addressNew" });

                await ClinicController.getFullClinicDataById(req, res, next);

                expect(getFullClinicServiceStub.calledOnceWith(1)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith({ id: 1, clinicData: "clinicNew", addressData: "addressNew" })).to.be.true;
            });
        });
    });
    describe("Negative test", () => {
        describe("CreateDoctor() =>:", () => {
            it("expect error('CreateError'), when clinicService throws error", async () => {
                const req = { body: { clinicData: "clinic", addressData: "address" } };
                const createClinicServiceStub = sinon.stub(ClinicService, "createClinic").rejects(new Error("CreateError"));

                await ClinicController.createClinic(req, res, next);

                expect(createClinicServiceStub.calledOnceWith("clinic", "address")).to.be.true;
                expect(next.calledOnceWith(new Error('CreateError')));
                expect(res.status.calledOnce).to.be.false;
                expect(res.json.calledOnce).to.be.false;
            });
        });
        describe("updateClinicById() =>:", () => {
            it("expect error('UpdateError'), when clinicService throws error", async () => {
                const req = { params: { id: 1 }, body: { clinicData: "clinic", addressData: "address" } };
                const updateDoctorServiceStub = sinon.stub(ClinicService, "updateClinic").rejects(new Error("CreateError"));

                await ClinicController.updateClinicById(req, res, next);

                expect(updateDoctorServiceStub.calledOnceWith(1, "clinic", "address")).to.be.true;
                expect(next.calledOnceWith(new Error('UpdateError')));
                expect(res.status.calledOnce).to.be.false;
                expect(res.json.calledOnce).to.be.false;
            });
        });
        describe("getClinicById() =>:", () => {
            it("expect error('GetError'), when clinicService throws error", async () => {
                const req = { params: { id: 1 } };
                const getClinicServiceStub = sinon.stub(ClinicService, "getClinicById").rejects(new Error("GetError"));

                await ClinicController.getClinicById(req, res, next);

                expect(getClinicServiceStub.calledOnceWith(1)).to.be.true;
                expect(next.calledOnceWith(new Error('GetError')));
                expect(res.status.calledOnceWith(200)).to.be.false;
                expect(res.json.calledOnceWith({ id: 1})).to.be.false;
            });
        });
        describe("getFullClinicDataById() =>:", () => {
            it("expect error('GetError'), when clinicService throws error", async () => {
                const req = { params: { id: 1 } };
                const getFullClinicServiceStub = sinon.stub(ClinicService, "getFullClinicDataById").rejects(new Error("GetError"));

                await ClinicController.getFullClinicDataById(req, res, next);

                expect(getFullClinicServiceStub.calledOnceWith(1)).to.be.true;
                expect(next.calledOnceWith(new Error('GetError')));
                expect(res.status.calledOnceWith(200)).to.be.false;
                expect(res.json.calledOnceWith({ id: 1})).to.be.false;
            });
        });
    });
});