require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const db = require("../../../src/models");
const ServiceService = require("../../../src/services/serviceService");
const ClinicService = require("../../../src/services/clinicService");
const SpecialtyService = require("../../../src/services/specialtyService");
const AppError = require("../../../src/utils/appError");

use(chaiAsPromised);

describe("Service Service", () => {
    afterEach(() => {
        sinon.restore();
    });

    describe("Positive tests", () => {
        describe("createService() =>:", () => {
            let getClinicByIdStub, getSpecialtyByIdStub, createStub;

            beforeEach(() => {
                getClinicByIdStub = sinon.stub(ClinicService, "getClinicById");
                getSpecialtyByIdStub = sinon.stub(SpecialtyService, "getSpecialtyById");
                createStub = sinon.stub(db.Services, "create");
            });
            it("expect create a new service successfully when valid clinic ID, name, specialty ID, and price are provided", async () => {
                const clinicId = 1;
                const name = "Test Service";
                const specialtyId = 2;
                const price = 100;

                const expectedService = { id: 1, name, price, clinic_id: clinicId, specialty_id: specialtyId };

                getClinicByIdStub.resolves({ id: clinicId });
                getSpecialtyByIdStub.resolves({ id: specialtyId });
                createStub.resolves(expectedService);

                const result = await ServiceService.createService(clinicId, name, specialtyId, price);

                expect(getClinicByIdStub.calledOnceWith(clinicId)).to.be.true;
                expect(getSpecialtyByIdStub.calledOnceWith(specialtyId)).to.be.true;
                expect(createStub.calledOnceWith({ name, price, clinic_id: clinicId, specialty_id: specialtyId })).to.be.true;
                expect(result).to.deep.equal(expectedService);
            });
        });
        describe("getAllServices() =>:", () => {
            let findAllStub;

            beforeEach(() => {
                findAllStub = sinon.stub(db.Services, "findAll")
            });
            it("should return all services when getAllServices is called", async () => {
                const mockServices = [
                    { id: 1, name: "Service 1", price: 100 },
                    { id: 2, name: "Service 2", price: 200 }
                ];
                findAllStub.resolves(mockServices);

                const result = await ServiceService.getAllServices();

                expect(findAllStub.calledOnce).to.be.true;
                expect(result).to.deep.equal(mockServices);
            });
        });
        describe("getServiceById() =>:", () => {
            let findByPkStub;
            beforeEach(() => {
                findByPkStub = sinon.stub(db.Services, "findByPk");
            });
            it("expect return a specific service when getServiceById is called with a valid ID", async () => {
                const serviceId = 1;
                const expectedService = { id: serviceId, name: "Test Service", price: 100 };
                findByPkStub.resolves(expectedService);

                const result = await ServiceService.getServiceById(serviceId);

                expect(findByPkStub.calledOnceWith(serviceId)).to.be.true;
                expect(result).to.deep.equal(expectedService);
            });
        });
        describe("updateService() =>:", () => {
            let findByPkStub, updateStub;
            beforeEach(() => {
                findByPkStub = sinon.stub(db.Services, "findByPk");
                updateStub = sinon.stub()
            });
            it("should update a service successfully when updateService is called with valid data", async () => {
                const serviceId = 1;
                const initialService = { id: serviceId, name: "Initial Service", price: 100 };
                const updatedData = { name: "Updated Service", price: 150 };
                const updatedService = { ...initialService, ...updatedData };

                findByPkStub.resolves(initialService);
                updateStub.resolves(updatedService);
                initialService.update = updateStub;

                const result = await ServiceService.updateService(serviceId, updatedData);

                expect(findByPkStub.calledOnceWith(serviceId)).to.be.true;
                expect(updateStub.calledOnceWith(updatedData)).to.be.true;
                expect(result).to.deep.equal(updatedService);
            });
        });
        describe("deleteService() =>:", () => {
            let findByPkStub, updateStub;
            beforeEach(() => {
                findByPkStub = sinon.stub(db.Services, "findByPk");
                updateStub = sinon.stub()
            });
            it("expect delete a service successfully when deleteService is called with a valid ID", async () => {
                const serviceId = 1;
                const mockService = { id: serviceId, destroy: sinon.stub().resolves() };
                findByPkStub.resolves(mockService);

                await ServiceService.deleteService(serviceId);

                expect(findByPkStub.calledOnceWith(serviceId)).to.be.true;
                expect(mockService.destroy.calledOnce).to.be.true;
            });
        });
    });
    describe("Negative tests", () => {
        describe("createService() =>:", () => {
            let getClinicByIdStub, getSpecialtyByIdStub, createStub;

            beforeEach(() => {
                getClinicByIdStub = sinon.stub(ClinicService, "getClinicById");
                getSpecialtyByIdStub = sinon.stub(SpecialtyService, "getSpecialtyById");
                createStub = sinon.stub(db.Services, "create");
            });
            it("expect throw an error when creating a service with non-existent specialty ID", async () => {
                const clinicId = 1;
                const name = "Test Service";
                const specialtyId = 999;
                const price = 100;

                getClinicByIdStub.resolves({ id: clinicId });
                getSpecialtyByIdStub.rejects(new AppError("Specialty not found"));

                await expect(ServiceService.createService(clinicId, name, specialtyId, price))
                    .to.be.rejectedWith("Specialty not found");

                expect(getClinicByIdStub.calledOnceWith(clinicId)).to.be.true;
                expect(getSpecialtyByIdStub.calledOnceWith(specialtyId)).to.be.true;
                expect(createStub.called).to.be.false;
            });
        });
        describe("getAllServices() =>:", () => {
            let findAllStub;
            beforeEach(() => {
                findAllStub = sinon.stub(db.Services, "findAll")
            });
            it("expect throw an error, when no services are found in getAllServices", async () => {
                findAllStub.resolves(null);

                await expect(ServiceService.getAllServices())
                    .to.be.rejectedWith("Specialties not found");

                expect(findAllStub.calledOnce).to.be.true;
            });
        });
        describe("getServiceById() =>:", () => {
            let findByPkStub;
            beforeEach(() => {
                findByPkStub = sinon.stub(db.Services, "findByPk")
            });
            it("expect throw an error when getServiceById is called with a non-existent ID", async () => {
                const nonExistentId = 999;
                findByPkStub.resolves(null);

                await expect(ServiceService.getServiceById(nonExistentId))
                    .to.be.rejectedWith("Specialty not found");

                expect(findByPkStub.calledOnceWith(nonExistentId)).to.be.true;
            });
        });
        describe("updateService() =>:", () => {
            let findByPkStub;
            beforeEach(() => {
                findByPkStub = sinon.stub(db.Services, "findByPk")
            });
            it("expect throw an error when updateService is called with a non-existent service ID", async () => {
                const nonExistentId = 999;
                const updateData = { name: "Updated Service", price: 150 };
                findByPkStub.resolves(null);

                await expect(ServiceService.updateService(nonExistentId, updateData))
                    .to.be.rejectedWith("Specialty not found");

                expect(findByPkStub.calledOnceWith(nonExistentId)).to.be.true;
            });
        });
        describe("deleteService() =>:", () => {
            let findByPkStub;
            beforeEach(() => {
                findByPkStub = sinon.stub(db.Services, "findByPk")
            });
            it("expect throw an error when deleteService is called with a non-existent service ID", async () => {
                const nonExistentId = 999;
                findByPkStub.resolves(null);

                await expect(ServiceService.deleteService(nonExistentId))
                    .to.be.rejectedWith("Specialty not found");

                expect(findByPkStub.calledOnceWith(nonExistentId)).to.be.true;
            });
        });
    });
});
