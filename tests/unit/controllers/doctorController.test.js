require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const DoctorController = require("../../../src/controllers/doctorController");
const DoctorService = require("../../../src/services/doctorService");
const AppError = require("../../../src/utils/appError");

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
                const req = { params: { doctorId: 1 } };
                const doctor = { id: 1, name: "doctor " }
                const getDoctorByIdStub = sinon.stub(DoctorService, "getDoctorById").resolves(doctor);

                await DoctorController.getDoctorById(req, res, next);

                expect(getDoctorByIdStub.calledOnceWith(req.params.doctorId)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith(doctor)).to.be.true;
            });
        });
        describe("updateDoctorById()", () => {
            it("expect update patient data and return", async () => {
                const doctorData = { userData: "foo", addressData: "address", doctorData: "foo", servicesIds: [1] };
                const req = { params: { userId: 1 }, body: doctorData };
                const updateData = { userData: "New", doctorData: "New" };
                const updateDoctorServiceStub = sinon.stub(DoctorService, "updateDoctorById").resolves(updateData);

                await DoctorController.updateDoctorById(req, res, next);

                expect(updateDoctorServiceStub.calledOnceWith({ userId: req.params.userId, ...req.body })).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith(updateData)).to.be.true;
            });
        });
        describe("getShortDoctorById() =>:", () => {
            it("expect to get a doctor, when doctor exists.", async () => {
                const req = { params: { doctorId: 1 } };
                const doctor = { id: 1, name: "doctor " }
                const getShortDoctorByIdStub = sinon.stub(DoctorService, "getShortDoctorById").resolves(doctor);

                await DoctorController.getShortDoctorById(req, res, next);

                expect(getShortDoctorByIdStub.calledOnceWith(req.params.doctorId)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith(doctor)).to.be.true;
            });
        });
        describe("getDoctorsByClinicWithSorting() =>:", () => {
            it("expect to get a doctor, when doctor exists.", async () => {
                const req = { params: { clinicId: 1 }, query: { gender: "male", sort: "abc" } };
                const doctor = { id: 1, name: "doctor " }
                const getDoctorsByClinicWithSortingStub = sinon.stub(DoctorService, "getDoctorsByClinicWithSorting").resolves(doctor);

                await DoctorController.getDoctorsByClinicWithSorting(req, res, next);

                expect(getDoctorsByClinicWithSortingStub.calledOnceWith(req.params.clinicId, req.query)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith(doctor)).to.be.true;
            });
        });
    });
    describe("Negative test", () => {
        describe("createDoctor() =>:", () => {
            it("expect error('CreateError'), when error in service", async () => {
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
                const createDoctorServiceStub = sinon.stub(DoctorService, "createDoctor").rejects(new AppError('CreateError'));

                await DoctorController.createDoctor(req, res, next);

                expect(createDoctorServiceStub.calledOnce).to.be.true;
                expect(next.calledOnceWith(new AppError('CreateError')));
                expect(res.status.calledOnce).to.be.false;
                expect(res.json.calledOnce).to.be.false;
            });
        });
        describe("getDoctorById() =>:", () => {
            it("expect error('GetError'), when error in service", async () => {
                const req = { params: { doctorId: 1 } };
                const getDoctorByIdStub = sinon.stub(DoctorService, "getDoctorById").rejects(new AppError('GetError'));

                await DoctorController.getDoctorById(req, res, next);

                expect(getDoctorByIdStub.calledOnceWith(req.params.doctorId)).to.be.true;
                expect(next.calledOnceWith(new AppError('GetError')));
                expect(res.status.calledOnce).to.be.false;
                expect(res.json.calledOnce).to.be.false;
            });
        });
        describe("updateDoctorById()", () => {
            it("expect error('UpdateError'), when error in service", async () => {
                const doctorData = { userData: "foo", addressData: "address", doctorData: "foo", servicesIds: [1] };
                const req = { params: { userId: 1 }, body: doctorData };
                const updateDoctorServiceStub = sinon.stub(DoctorService, "updateDoctorById").rejects(new AppError('UpdateError'));

                await DoctorController.updateDoctorById(req, res, next);

                expect(updateDoctorServiceStub.calledOnceWith({ userId: req.params.userId, ...req.body })).to.be.true;
                expect(next.calledOnceWith(new AppError('UpdateError')));
                expect(res.status.calledOnce).to.be.false;
                expect(res.json.calledOnce).to.be.false;
            });
        });
        describe("getShortDoctorById() =>:", () => {
            it("expect error('GetError'), when error in service", async () => {
                const req = { params: { doctorId: 1 } };
                const getShortDoctorByIdStub = sinon.stub(DoctorService, "getShortDoctorById").rejects(new AppError('GetError'));

                await DoctorController.getShortDoctorById(req, res, next);

                expect(getShortDoctorByIdStub.calledOnceWith(req.params.doctorId)).to.be.true;
                expect(next.calledOnceWith(new AppError('GetError')));
                expect(res.status.calledOnce).to.be.false;
                expect(res.json.calledOnce).to.be.false;
            });
        });
        describe("getDoctorsByClinicWithSorting() =>:", () => {
            it("expect error('GetError'), when error in service", async () => {
                const req = { params: { clinicId: 1 }, query: { gender: "male", sort: "abc" } };
                const getDoctorsByClinicWithSortingStub = sinon.stub(DoctorService, "getDoctorsByClinicWithSorting").rejects(new AppError('GetError'));

                await DoctorController.getDoctorsByClinicWithSorting(req, res, next);

                expect(getDoctorsByClinicWithSortingStub.calledOnceWith(req.params.clinicId, req.query)).to.be.true;
                expect(next.calledOnceWith(new AppError('GetError')));
                expect(res.status.calledOnce).to.be.false;
                expect(res.json.calledOnce).to.be.false;
            });
        });
    });
});