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
            it("expect create clinic when valid data", async () => {
                const clinic = 1;
                const address = 2;
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
            it("expect get clinics by id, when it is in db", async () => {
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
            it("expect create clinic when valid data", async () => {
                const id = 1;
                const clinic = "foo";
                findOneStub.resolves(clinic);

                const result = await ClinicService.getFullClinicById(id);

                expect(findOneStub.calledOnceWith({ where: { id: id }, include: [db.Addresses] })).to.be.true;
                expect(result).to.equals(clinic);
            });
        });
        describe("getAllClinicsFullData() =>:", () => {
            let findAllStub;

            beforeEach(async () => {
                findAllStub = sinon.stub(db.Clinics, "findAll");
            });
            it("expect create clinic when valid data", async () => {
                const clinic = "foo";
                findAllStub.resolves(clinic);

                const result = await ClinicService.getAllClinicsFullData();

                expect(findAllStub.calledOnceWith({ include: [db.Addresses] })).to.be.true;
                expect(result).to.equals(clinic);
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
            it("should return the updated clinic", async () => {
                const id = 1;
                const newClinic = { name: "Updated Clinic" };
                const addressData = { city: "foo", street: "foo", home: 2, flat: 1, post_index: "123-1234" };
                findByPkClinicStub.resolves({ updateClinics: updateClinicsStub, getAddresses: getAddressesStub });
                updateClinicsStub.resolves();
                updateAddressStub.resolves();

                await ClinicService.updateClinic(id, newClinic, addressData);

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
            it("expect to destroy clinic, when it exists", async () => {
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

            it("expect to throw an error('Create clinic failed') when Clinic creation fails", async () => {
                const clinic = 1;
                const address = 2;
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
            it("expect error('Clinic not found'), when it isn't in db", async () => {
                findByPkStub.resolves(false);

                await expect(ClinicService.getClinicById(1)).to.be.rejectedWith(Error, "Clinic not found");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
            it("expect error('Clinic error'), when error db", async () => {
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
            it("expend expect to throw an error('Clinic error'), when error on db", async () => {
                const id = 1;
                const error = new Error("Clinic error");
                findOneStub.rejects(error);

                await expect(ClinicService.getFullClinicById(id)).to.be.rejectedWith(error);

                expect(findOneStub.calledOnceWith({ where: { id: id }, include: [db.Addresses] })).to.be.true;
            });
            it("expend expect to throw an error('Clinic not found'), when error on db", async () => {
                const id = 1;
                findOneStub.resolves(false);

                await expect(ClinicService.getFullClinicById(id)).to.be.rejectedWith(Error, "Clinic not found");

                expect(findOneStub.calledOnceWith({ where: { id: id }, include: [db.Addresses] })).to.be.true;
            });
        });
        describe("getAllClinicsFullData() =>:", () => {
            let findAllStub;

            beforeEach(async () => {
                findAllStub = sinon.stub(db.Clinics, "findAll");
            });
            it("expend expect to throw an error('Clinic error'), when error on db", async () => {
                const error = new Error("Clinic error");
                findAllStub.rejects(error);

                await expect(ClinicService.getAllClinicsFullData()).to.be.rejectedWith(error);

                expect(findAllStub.calledOnceWith({ include: [db.Addresses] })).to.be.true;
            });
            it("expend expect to throw an error('Clinics not found'), when error on db", async () => {
                findAllStub.resolves(false);

                await expect(ClinicService.getAllClinicsFullData(1)).to.be.rejectedWith(Error, "Clinics not found");

                expect(findAllStub.calledOnceWith({ include: [db.Addresses] })).to.be.true;
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
            it("expend expect to throw an error('Clinics not found'), when clinic isn't in db", async () => {
                const id = 1;
                const newClinic = { name: "Updated Clinic" };
                const addressData = { city: "foo", street: "foo", home: 2, flat: 1, post_index: "123-1234" };

                findByPkClinicStub.resolves(null);

                await expect(ClinicService.updateClinic(id, newClinic, addressData)).to.be.rejectedWith(Error, "Clinics not found");

                expect(transactionStub.commit.calledOnce).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
                expect(updateClinicsStub.called).to.be.false;
            });
            it("expend expect to throw an error('Error update'), when error on db", async () => {
                const id = 1;
                const newClinic = { name: "Updated Clinic" };
                const addressData = { city: "foo", street: "foo", home: 2, flat: 1, post_index: "123-1234" };
                const error = new Error("Error update");
                findByPkClinicStub.resolves({ updateClinics: updateClinicsStub });
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
                findByPkClinicStub.resolves({ updateClinics: updateClinicsStub, getAddresses: getAddressesStub });
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
            it("expect Error('Clinic not found'), when it doesn't exist", async () => {
                findByPkStub.resolves(false);

                await expect(ClinicService.deleteClinicById(1)).to.be.rejectedWith(Error, "Clinic not found");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(destroyStub.calledOnce).to.be.false;
            })
        })
    });
});