require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const db = require("../../../src/models");
const SpecialtyService = require("../../../src/services/specialtyService");

use(chaiAsPromised);

describe("Specialty Service", () => {
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive tests", () => {
        describe("createSpecialty() =>:", () => {
            let createStub;

            beforeEach(async () => {
                createStub = sinon.stub(db.Specialties, "create");
            });
            it("expect create specialty when valid data", async () => {
                const specialty = "Psychiatra"
                createStub.resolves({ id: 1, name: specialty });

                const result = await SpecialtyService.createSpecialty(specialty);

                expect(createStub.calledOnceWith(specialty)).to.be.true;
                expect(result).to.deep.equals({ id: 1, name: specialty });
            });
        });
        describe("getSpecialtyById() =>:", () => {
            let findByPkStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Specialties, "findByPk");
            });
            it("expect return specialty by id, when it is", async () => {
                const specialty = { id: 1, name: "Psychiatra" };
                findByPkStub.resolves(specialty);

                const result = await SpecialtyService.getSpecialtyById(1);

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(result).to.deep.equals(specialty);
            });
        });
        describe("updateSpecialty() =>:", () => {
            let updateStub, findByPkStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Specialties, "findByPk");
                updateStub = sinon.stub();
            });
            it("expect create specialty when valid data", async () => {
                const specialty = { id: 1, name: "Pychiatra" }
                findByPkStub.resolves({ update: updateStub });
                updateStub.resolves({ id: 1, name: "Psychiatra" });

                const result = await SpecialtyService.updateSpecialty(1, specialty);

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(result).to.deep.equals({ id: 1, name: "Psychiatra" });
            });
        });
        describe("deleteSpecialty() =>:", () => {
            let destroyStub, findByPkStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Specialties, "findByPk");
                destroyStub = sinon.stub();
            });
            it("expect create specialty when valid data", async () => {
                findByPkStub.resolves({ destroy: destroyStub });
                destroyStub.resolves();

                await SpecialtyService.deleteSpecialty(1);

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
        });
    });
    describe("Negative tests", () => {
        describe("createSpecialty () =>:", () => {
            let createStub;
            beforeEach(async () => {
                createStub = sinon.stub(db.Specialties, "create");
            });
            it("expect throws Error('Specialty error') when bd error", async () => {
                const specialty = "Psychiatra"
                createStub.rejects(new Error("Specialty error"));

                await expect(SpecialtyService.createSpecialty(specialty)).to.be.rejectedWith(Error, "Specialty error");

                expect(createStub.calledOnceWith(specialty)).to.be.true;
            });
        });
        describe("getSpecialtyById() =>:", () => {
            let findByPkStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Specialties, "findByPk");
            });
            it("expect throws Error('Specialty not found'), when it isn't", async () => {
                findByPkStub.resolves(false);

                await expect(SpecialtyService.getSpecialtyById(1)).to.be.rejectedWith(Error, "Specialty not found");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
            it("expect throws Error('Specialty error'), when it isn't", async () => {
                findByPkStub.rejects(new Error("Specialty error"));

                await expect(SpecialtyService.getSpecialtyById(1)).to.be.rejectedWith(Error, "Specialty error");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
        });
        describe("updateSpecialty() =>:", () => {
            let updateStub, findByPkStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Specialties, "findByPk");
                updateStub = sinon.stub();
            });
            it("expect throw error('Specialty not found'), when it isn't", async () => {
                const specialty = { id: 1, name: "Pychiatra" }
                findByPkStub.throws(new Error("Specialty not found"));

                await expect(SpecialtyService.updateSpecialty(1, specialty)).to.be.rejectedWith(Error, "Specialty not found");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
            it("expect throw error('Specialty error'), when error db", async () => {
                const specialty = { id: 1, name: "Pychiatra" }
                findByPkStub.resolves({ update: updateStub });
                updateStub.rejects(new Error("Specialty error"));

                await expect(SpecialtyService.updateSpecialty(1, specialty)).to.be.rejectedWith(Error, "Specialty error");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
        });
        describe("deleteSpecialty() =>:", () => {
            let destroyStub, findByPkStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Specialties, "findByPk");
                destroyStub = sinon.stub();
            });
            it("expect throw error('Specialty not found'), when it isn't", async () => {
                findByPkStub.throws(new Error("Specialty not found"));

                await expect(SpecialtyService.deleteSpecialty(1)).to.be.rejectedWith(Error, "Specialty not found");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
            it("expect throw error('Specialty error'), when error db", async () => {
                findByPkStub.resolves({ destroy: destroyStub });
                destroyStub.rejects(new Error("Specialty error"));

                await expect(SpecialtyService.deleteSpecialty(1)).to.be.rejectedWith(Error, "Specialty error");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
        });
    });
});