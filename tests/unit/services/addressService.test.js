require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const db = require("../../../src/models");
const sequelize = require("../../../src/config/db");
const AddressService = require("../../../src/services/addressService");

use(chaiAsPromised);

describe("Address Service", () => {
    describe("Positive tests", () => {
        afterEach(async () => {
            sinon.restore();
        });
        describe("addressCreate() => Create:", () => {
            let createAddressStub;

            beforeEach(async () => {
                createAddressStub = sinon.stub(db.Addresses, "create");
            });

            it("expect address to be created with transaction and return", async () => {
                const newAddress = { city: "foo", street: "foo", home: 1, flat: 1, post_index: "123-1234" };
                createAddressStub.resolves({ ...newAddress, id: 1 });

                const result = await AddressService.createAddress(newAddress);

                expect(createAddressStub.calledOnceWith(newAddress)).to.be.true;
                expect(result).to.deep.equals({ ...newAddress, id: 1 });
            });
        });
        describe("updateAddress => Update:", () => {
            let findByPkAddressStub, updateAddressStub

            beforeEach(async () => {
                transactionStub = sinon.stub(sequelize, "transaction").resolves();
                findByPkAddressStub = sinon.stub(db.Addresses, "findByPk");
                updateAddressStub = sinon.stub(db.Addresses, "update")
            });

            it("expend address to be updated, when valid data and transaction are ", async () => {
                const id = 1;
                const newAddress = { city: "foo", street: "foo", home: 1, flat: 1, post_index: "123-1234" };
                findByPkAddressStub.resolves({ update: updateAddressStub });
                updateAddressStub.resolves({ ...newAddress, home: 2 });

                const result = await AddressService.updateAddress(id, newAddress, transactionStub);

                expect(findByPkAddressStub.calledOnceWith(id)).to.be.true;
                expect(updateAddressStub.calledOnceWith(newAddress, { transaction: transactionStub })).to.be.true;
                expect(result).to.deep.include({ ...newAddress, home: 2 });
            })
        });
    });
    describe("Negative tests", () => {
        afterEach(async () => {
            sinon.restore();
        });
        describe("addressCreate() => Create:", () => {
            let createAddressStub;

            beforeEach(async () => {
                createAddressStub = sinon.stub(db.Addresses, "create");
            });

            it("expect throws error('Create address failed') when ", async () => {
                const newAddress = { city: "foo", street: "foo", home: 1, flat: 1, post_index: "123-1234" };
                createAddressStub.rejects(new Error("Create address failed"));

                await expect(AddressService.createAddress(newAddress)).to.be.rejectedWith(Error, "Create address failed");

                expect(createAddressStub.calledOnceWith(newAddress)).to.be.true;
            });
        });
        describe("updateAddress => Update:", () => {
            let findByPkAddressStub, updateAddressStub

            beforeEach(async () => {
                transactionStub = sinon.stub(sequelize, "transaction").resolves();
                findByPkAddressStub = sinon.stub(db.Addresses, "findByPk");
                updateAddressStub = sinon.stub(db.Addresses, "update")
            });

            it("expend error('Address not found'), when address isn't in db", async () => {
                const id = 1;
                const newAddress = { city: "foo", street: "foo", home: 1, flat: 1, post_index: "123-1234" };
                findByPkAddressStub.resolves(false);

                await expect(AddressService.updateAddress(id, newAddress, transactionStub)).to.be.rejectedWith(Error, "Address not found");

                expect(findByPkAddressStub.calledOnceWith(id)).to.be.true;
                expect(updateAddressStub.calledOnce).to.be.false;
            });
            it("expend error('Address error'), when error with db", async () => {
                const id = 1;
                const newAddress = { city: "foo", street: "foo", home: 1, flat: 1, post_index: "123-1234" };
                findByPkAddressStub.resolves({update: updateAddressStub});
                updateAddressStub.rejects(new Error("Address error"));

                await expect(AddressService.updateAddress(id, newAddress, transactionStub)).to.be.rejectedWith(Error, "Address error");

                expect(findByPkAddressStub.calledOnceWith(id)).to.be.true;
                expect(updateAddressStub.calledOnceWith(newAddress, {transaction: transactionStub})).to.be.true;
            })
        });
    });
});