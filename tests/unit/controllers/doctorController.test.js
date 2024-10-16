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
        describe("CreateDoctor() =>:", () => {
            it("Expect to create a doctor associated with the clinic.", async () => {
                const req = { body: { userData: "user", doctorData: "doctor", specialty_id: 1, clinic_id: 1 } };
                const createDoctorServiceStub = sinon.stub(DoctorService, "createDoctorByClinic").resolves({id: 1, ...req.body});
                
                await DoctorController.createDoctor(req, res, next);
                
                expect(createDoctorServiceStub.calledOnceWith("user", "doctor", 1, 1)).to.be.true;
                expect(res.status.calledOnceWith(201)).to.be.true;
                expect(res.json.calledOnceWith({id: 1, ...req.body})).to.be.true;
            })
        })
    });
    describe("Negative test", () => {
        describe("CreateDoctor() =>:", () => {
            it("Expect error('CreateError') a doctor associated with the clinic.", async () => {
                const req = { body: { userData: "user", doctorData: "doctor", specialty_id: "House", clinic_id: 1 } };
                const createDoctorServiceStub = sinon.stub(DoctorService, "createDoctorByClinic").rejects(new Error('CreateError'));
                
                await DoctorController.createDoctor(req, res, next);
                
                expect(createDoctorServiceStub.calledOnceWith(req.body))
                expect(next.calledOnceWith(new Error('CreateError')));
                expect(res.status.calledOnce).to.be.false;
                expect(res.json.calledOnce).to.be.false;
            })
        })
    });
});