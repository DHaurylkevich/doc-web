require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const DoctorController = require("../../../src/controllers/doctorController");
const DoctorService = require("../../../src/services/doctorService");

use(chaiAsPromised);

describe("Doctor Controller", () => {
    let next, res;
    beforeEach(async () => {
        next = sinon.stub();
        res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    });
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive test", () => {
        describe("createDoctor() =>:", () => {
            it("expect to create a doctor associated with the clinic.", async () => {
                const req = {
                    body: {
                        userData: "user",
                        addressData: "address",
                        doctorData: "doctor",
                        specialtyId: 1,
                        servicesIds: [1, 2]
                    },
                    params: { clinicId: 1 }
                };
                const createDoctorServiceStub = sinon.stub(DoctorService, "createDoctor").resolves({ id: 1, ...req.body });

                await DoctorController.createDoctor(req, res, next);

                expect(createDoctorServiceStub.calledOnce).to.be.true;
                expect(createDoctorServiceStub.firstCall.args[0]).to.deep.include({
                    userData: req.body.userData,
                    addressData: req.body.addressData,
                    doctorData: req.body.doctorData,
                    specialtyId: req.body.specialtyId,
                    clinicId: req.params.clinicId,
                    servicesIds: req.body.servicesIds
                });
                expect(res.status.calledOnceWith(201)).to.be.true;
                expect(res.json.calledOnceWith({ id: 1, ...req.body })).to.be.true;
            });
        });
        describe("getDoctorById() =>:", () => {
            it("expect to get a doctor, when doctor exists.", async () => {
                const req = { params: { userId: 1 } };
                const createDoctorServiceStub = sinon.stub(DoctorService, "createDoctor").resolves({ id: 1, ...req.body });
                await DoctorController.createDoctor(req, res, next);

                expect(createDoctorServiceStub.calledOnce).to.be.true;
                expect(createDoctorServiceStub.firstCall.args[0]).to.deep.include({
                    userData: req.body.userData,
                    addressData: req.body.addressData,
                    doctorData: req.body.doctorData,
                    specialtyId: req.body.specialtyId,
                    clinicId: req.params.clinicId,
                    servicesIds: req.body.servicesIds
                });
                expect(res.status.calledOnceWith(201)).to.be.true;
                expect(res.json.calledOnceWith({ id: 1, ...req.body })).to.be.true;
            });
        });
        describe("updateDoctorById()", () => {
            it("expect update patient data and return", async () => {
                const oldData = { userData: "foo", doctorData: "foo" };
                const req = { params: { id: 1 }, body: oldData };
                const newData = { userData: "New", doctorData: "New" };
                const updateDoctorServiceStub = sinon.stub(DoctorService, "updateDoctor").resolves(newData);

                await DoctorController.updateDoctorById(req, res, next);

                expect(updateDoctorServiceStub.calledOnceWith(1, req.body.userData, req.body.doctorData)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith(newData)).to.be.true;
            });
        });
    });
    describe("Negative test", () => {
        describe("CreateDoctor() =>:", () => {
            it("Expect error('CreateError') a doctor associated with the clinic.", async () => {
                const req = { body: { userData: "user", doctorData: "doctor", specialty_id: "House", clinic_id: 1 } };
                const createDoctorServiceStub = sinon.stub(DoctorService, "createDoctor").rejects(new Error('CreateError'));

                await DoctorController.createDoctor(req, res, next);

                expect(createDoctorServiceStub.calledOnceWith(req.body))
                expect(next.calledOnceWith(new Error('CreateError')));
                expect(res.status.calledOnce).to.be.false;
                expect(res.json.calledOnce).to.be.false;
            });
        });
        describe("updateDoctorById()", () => {
            it("expect error('Update error') doctor data and return", async () => {
                const oldData = { userData: "foo", doctorData: "foo" };
                const req = { params: { id: 1 }, body: oldData };
                const error = new Error("Update error");
                sinon.stub(DoctorService, "updateDoctor").rejects(error);

                await DoctorController.updateDoctorById(req, res, next);

                expect(next.calledOnceWith(error)).to.be.true;
                expect(res.status.calledOnce).to.be.false;
                expect(res.json.calledOnce).to.be.false;
            });
        });
    });
});