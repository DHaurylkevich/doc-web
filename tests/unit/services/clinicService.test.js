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
        describe("updateClinic => Update:", () => {
            let updateClinicStub

            beforeEach(async () => {
                transactionStub = sinon.stub(sequelize, "transaction").resolves();
                updateClinicStub = sinon.stub(db.Clinices, "update")
            });

            it("expend Clinic to be updated, when valid data and transaction are ", async () => {
                const id = 1;
                const newClinic = { city: "foo", street: "foo", home: 1, flat: 1, post_index: "123-1234" };
                updateClinicStub.resolves({ ...newClinic, home: 2 });

                const result = await ClinicService.updateClinic({ update: updateClinicStub }, newClinic, transactionStub);

                expect(updateClinicStub.calledOnceWith(newClinic, { transaction: transactionStub })).to.be.true;
                expect(result).to.deep.include({ ...newClinic, home: 2 });
            })
        });
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
        describe("updateClinic => Update:", () => {
            let updateClinicStub, transactionStub;

            beforeEach(async () => {
                transactionStub = sinon.stub(sequelize, "transaction").resolves();
                updateClinicStub = sinon.stub(db.Clinices, "update")
            });

            it("expend error('Clinic error'), when error with db", async () => {
                const newClinic = { city: "foo", street: "foo", home: 1, flat: 1, post_index: "123-1234" };
                updateClinicStub.rejects(new Error("Clinic error"));

                await expect(ClinicService.updateClinic({ update: updateClinicStub }, newClinic, transactionStub)).to.be.rejectedWith(Error, "Clinic error");

                expect(updateClinicStub.calledOnceWith(newClinic, { transaction: transactionStub })).to.be.true;
            })
        });
    });
});