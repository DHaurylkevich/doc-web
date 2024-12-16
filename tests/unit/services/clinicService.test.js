require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const db = require("../../../src/models");
const sequelize = require("../../../src/config/db");
const ClinicService = require("../../../src/services/clinicService");
const AddressService = require("../../../src/services/addressService");

use(chaiAsPromised);

describe("Clinic Service", () => {
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive tests", () => {
        describe("clinicCreate() =>:", () => {
            let transactionStub, createAddressStub, createClinicStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                createAddressStub = sinon.stub();
                createClinicStub = sinon.stub(db.Clinics, "create");
            });
            it("expect a clinic to be created, when required data is valid", async () => {
                const clinic = { name: "House", nip: "1234567890", nr_license: "1234567890", email: "clinic@gmail.com", password: "1234567890", description: "foo" };
                const address = { city: "foo", street: "foo", province: "foo", home: 2, flat: 1, post_index: "123-1234" };
                createClinicStub.resolves({ createAddress: createAddressStub });

                await ClinicService.createClinic(clinic, address);

                expect(createClinicStub.calledOnceWith(clinic, { transaction: transactionStub })).to.be.true;
                expect(createAddressStub.calledOnce).to.be.true;
                expect(transactionStub.commit.calledOnce).to.be.true;
                expect(transactionStub.rollback.calledOnce).to.be.false;
            });
        });
        describe("getClinicById() =>:", () => {
            let findByPkStub;
            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Clinics, "findByPk");
            })
            it("expect return clinics by id, when it exists in the database", async () => {
                const clinic = { id: 1, name: "House" };
                findByPkStub.resolves(clinic);

                const result = await ClinicService.getClinicById(1);

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(result).to.deep.equal(clinic);
            });
        });
        describe("getFullClinicById() =>:", () => {
            let findOneStub;

            beforeEach(async () => {
                findOneStub = sinon.stub(db.Clinics, "findOne");
            });
            it("expect to return full clinic data, when it exists in the database", async () => {
                const clinicId = 1;
                const clinic = { name: "foo", address: { city: "foo" } };
                findOneStub.resolves(clinic);

                const result = await ClinicService.getFullClinicById(clinicId);

                expect(findOneStub.calledOnceWith({
                    where: { id: clinicId },
                    include: [{ model: db.Addresses, as: "address" }]
                })).to.be.true; expect(result.name).to.deep.equal(clinic.name);
                expect(result.address).to.deep.equal(clinic.address);
            });
        });
        describe("getAllClinicsFullData() =>:", () => {
            let findAllStub;

            beforeEach(async () => {
                findAllStub = sinon.stub(db.Clinics, "findAll");
            });
            it("expect to return all clinics with full data when no filters are provided", async () => {
                const mockClinics = [{
                    id: 1,
                    name: "Test Clinic",
                    address: { city: "Test City" },
                    services: [{
                        id: 1,
                        name: "Test Service",
                        specialty: { name: "Cardiology" }
                    }]
                }];
                findAllStub.resolves(mockClinics);

                const result = await ClinicService.getAllClinicsFullData({});

                expect(findAllStub.calledOnce).to.be.true;
                expect(findAllStub.firstCall.args[0]).to.deep.equal({
                    where: {},
                    include: [
                        {
                            model: db.Addresses,
                            as: "address"
                        },
                        {
                            model: db.Services,
                            as: "services",
                            include: [
                                {
                                    model: db.Specialties,
                                    as: "specialty",
                                    where: {}
                                }
                            ]
                        }
                    ]
                });
                expect(result).to.deep.equal(mockClinics);
            });
            it("expect to apply filters correctly when they are provided", async () => {
                const filters = {
                    name: "Test Clinic",
                    city: "Test City",
                    specialty: "Cardiology",
                    province: "Test Province"
                };
                const mockClinics = [{
                    id: 1,
                    name: filters.name,
                    address: { city: filters.city },
                    services: [{
                        specialty: { name: filters.specialty }
                    }]
                }];
                findAllStub.resolves(mockClinics);

                const result = await ClinicService.getAllClinicsFullData(filters);

                expect(findAllStub.calledOnce).to.be.true;
                expect(findAllStub.firstCall.args[0]).to.deep.equal({
                    where: {
                        name: filters.name,
                        province: filters.province
                    },
                    include: [
                        {
                            model: db.Addresses,
                            as: "address",
                            where: { city: filters.city }
                        },
                        {
                            model: db.Services,
                            as: "services",
                            include: [
                                {
                                    model: db.Specialties,
                                    as: "specialty",
                                    where: { specialty: filters.specialty }
                                }
                            ]
                        }
                    ]
                });
                expect(result).to.deep.equal(mockClinics);
            });
            it("expect to handle empty result when no clinics match filters", async () => {
                findAllStub.resolves([]);
                const filters = { name: "Non-existent Clinic" };

                const result = await ClinicService.getAllClinicsFullData(filters);

                expect(findAllStub.calledOnce).to.be.true;
                expect(result).to.be.an('array').that.is.empty;
            });
        });
        describe("updateClinic => Update:", () => {
            let updateClinicsStub, transactionStub, findByPkClinicStub, getAddressesStub, updateAddressStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                findByPkClinicStub = sinon.stub(db.Clinics, "findByPk");
                updateClinicsStub = sinon.stub();
                getAddressesStub = sinon.stub();
                updateAddressStub = sinon.stub(AddressService, "updateAddress");
            });
            it("expect to return the updated clinic, when data is valid", async () => {
                const clinicId = 1;
                const newClinic = { name: "Updated Clinic" };
                const addressData = { city: "foo", street: "foo", home: 2, flat: 1, post_index: "123-1234" };
                findByPkClinicStub.resolves({ update: updateClinicsStub, getAddress: getAddressesStub });
                updateClinicsStub.resolves();
                updateAddressStub.resolves();

                await ClinicService.updateClinic(clinicId, newClinic, addressData);

                expect(sequelize.transaction.calledOnce).to.be.true;
                expect(updateClinicsStub.calledOnceWith(newClinic, { transaction: transactionStub })).to.be.true;
                expect(getAddressesStub.calledOnce).to.be.true;
                expect(updateAddressStub.calledOnceWith(sinon.match.any, addressData, transactionStub)).to.be.true;
                expect(transactionStub.commit.calledOnce).to.be.true;
            });
        });
        describe("deleteClinicById", () => {
            let findByPkStub, destroyStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Clinics, "findByPk");
                destroyStub = sinon.stub();
            });
            it("expect to destroy clinic, when it exists in the database", async () => {
                findByPkStub.resolves({ destroy: destroyStub });
                destroyStub.resolves(true);

                await ClinicService.deleteClinicById(1);

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(destroyStub.calledOnce).to.be.true;
            })
        })
    });
    describe("Negative tests", () => {
        describe("clinicCreate() =>:", () => {
            let transactionStub, createAddressStub, createClinicStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                createAddressStub = sinon.stub();
                createClinicStub = sinon.stub(db.Clinics, "create");
            });

            it("expect to throw an error('Create clinic failed') and rollback transaction, when Clinic creation fails", async () => {
                const clinic = {};
                const address = {};
                const error = new Error("Create clinic failed")
                createClinicStub.rejects(error);

                await expect(ClinicService.createClinic(clinic, address)).to.be.rejectedWith(error);

                expect(createClinicStub.calledOnceWith(clinic)).to.be.true;
                expect(createAddressStub.calledOnce).to.be.false;
            });

            it("expect to throw an error('Create address failed') when Clinic creation fails", async () => {
                const clinic = 1;
                const address = 2;
                const error = new Error("Create address failed")
                createClinicStub.resolves({ createAddress: createAddressStub });
                createAddressStub.rejects(error);

                await expect(ClinicService.createClinic(clinic, address)).to.be.rejectedWith(error);

                expect(createClinicStub.calledOnceWith(clinic)).to.be.true;
                expect(createAddressStub.calledOnceWith(address)).to.be.true;
            });
        });
        describe("getClinicById() =>:", () => {
            let findByPkStub;
            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Clinics, "findByPk");
            })
            it("expect to throw an error('Clinic not found'), when clinic doesn't exist in the database", async () => {
                findByPkStub.resolves(false);

                await expect(ClinicService.getClinicById(1)).to.be.rejectedWith(Error, "Clinic not found");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
            it("expect to throw an error('Clinic error'), when error on database", async () => {
                findByPkStub.rejects(new Error("Clinic error"));

                await expect(ClinicService.getClinicById(1)).to.be.rejectedWith(Error, "Clinic error");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
        });
        describe("getFullClinicById() =>:", () => {
            let findOneStub;

            beforeEach(async () => {
                findOneStub = sinon.stub(db.Clinics, "findOne");
            });
            it("expend expect to throw an error('Clinic error'), when error on database", async () => {
                const clinicId = 1;
                const error = new Error("Clinic error");
                findOneStub.rejects(error);

                await expect(ClinicService.getFullClinicById(clinicId)).to.be.rejectedWith(error);

                expect(findOneStub.calledOnceWith({
                    where: { id: clinicId },
                    include: [{ model: db.Addresses, as: "address" }]
                })).to.be.true;
            });
            it("expend expect to throw an error('Clinic not found'), when clinic doesn't exist in the database", async () => {
                const clinicId = 1;
                findOneStub.resolves(false);

                await expect(ClinicService.getFullClinicById(clinicId)).to.be.rejectedWith(Error, "Clinic not found");

                expect(findOneStub.calledOnceWith({
                    where: { id: clinicId },
                    include: [{ model: db.Addresses, as: "address" }]
                })).to.be.true;
            });
        });
        describe("getAllClinicsFullData() =>:", () => {
            let findAllStub;

            beforeEach(async () => {
                findAllStub = sinon.stub(db.Clinics, "findAll");
            });
            it("should handle database errors correctly", async () => {
                const dbError = new Error("Database connection error");
                findAllStub.rejects(dbError);

                try {
                    await ClinicService.getAllClinicsFullData({});
                    expect.fail("Should have thrown an error");
                } catch (error) {
                    expect(error).to.equal(dbError);
                }
            });
        });
        describe("updateClinic => Update:", () => {
            let updateClinicsStub, transactionStub, findByPkClinicStub, getAddressesStub, updateAddressStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                findByPkClinicStub = sinon.stub(db.Clinics, "findByPk");
                updateClinicsStub = sinon.stub();
                getAddressesStub = sinon.stub();
                updateAddressStub = sinon.stub(AddressService, "updateAddress");
            });
            it("expend expect to throw an error('Clinics not found'), when clinic isn't in the database", async () => {
                const clinicId = 1;
                const newClinic = { name: "Updated Clinic" };
                const addressData = { city: "foo", street: "foo", home: 2, flat: 1, post_index: "123-1234" };

                findByPkClinicStub.resolves(null);

                await expect(ClinicService.updateClinic(clinicId, newClinic, addressData)).to.be.rejectedWith(Error, "Clinics not found");

                expect(transactionStub.commit.calledOnce).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
                expect(updateClinicsStub.called).to.be.false;
            });
            it("expend expect to throw an error('Error update'), when error on db", async () => {
                const id = 1;
                const newClinic = { name: "Updated Clinic" };
                const addressData = { city: "foo", street: "foo", home: 2, flat: 1, post_index: "123-1234" };
                const error = new Error("Error update");
                findByPkClinicStub.resolves({ update: updateClinicsStub });
                updateClinicsStub.rejects(error);

                await expect(ClinicService.updateClinic(id, newClinic, addressData)).to.be.rejectedWith(Error, "Error update");

                expect(transactionStub.commit.calledOnce).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
                expect(updateClinicsStub.called).to.be.true;
                expect(updateAddressStub.calledOnce).to.be.false;
            });
            it("expend expect to throw an error('Address error'), when error on db", async () => {
                const id = 1;
                const newClinic = { name: "Updated Clinic" };
                const addressData = { city: "foo", street: "foo", home: 2, flat: 1, post_index: "123-1234" };
                const error = new Error("Address error");
                findByPkClinicStub.resolves({ update: updateClinicsStub, getAddress: getAddressesStub });
                updateClinicsStub.resolves();
                updateAddressStub.throws(error);

                await expect(ClinicService.updateClinic(id, newClinic, addressData)).to.be.rejectedWith(Error, "Address error");

                expect(transactionStub.commit.calledOnce).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
                expect(updateClinicsStub.called).to.be.true;
                expect(updateAddressStub.calledOnce).to.be.true;
            });
        });
        describe("deleteClinicById", () => {
            let findByPkStub, destroyStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Clinics, "findByPk");
                destroyStub = sinon.stub();
            });
            it("expect Error('Clinic not found'), when it doesn't exist in the database", async () => {
                findByPkStub.resolves(false);

                await expect(ClinicService.deleteClinicById(1)).to.be.rejectedWith(Error, "Clinic not found");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(destroyStub.calledOnce).to.be.false;
            })
        })
    });
});