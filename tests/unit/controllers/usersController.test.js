require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const UserController = require("../../../src/controllers/userController");
const UserService = require("../../../src/services/userService");

use(chaiAsPromised);

describe("Users Controller", () => {
    let next, res;
    beforeEach(async () => {
        next = sinon.stub();
        res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    });
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive tests", () => {
        describe("getUserAccount() =>", () => {
            it("expect get user, when it exists", async () => {
                const req = { params: { userId: 3 } };
                const user = { id: 3, name: "FOO" }
                const getUserByIdStub = sinon.stub(UserService, "getUserById").resolves(user);

                await UserController.getUserAccount(req, res, next);

                expect(getUserByIdStub.calledOnceWith(req.params.userId)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith(user)).to.be.true;
            })
        })
        describe("updateUserPassword() =>", () => {
            it("expect changed password and return message, when valid data is provide", async () => {
                const req = { body: { oldPassword: "old", newPassword: "new" }, user: { id: "1" } };
                const updatePasswordStub = sinon.stub(UserService, "updatePassword").resolves();

                await UserController.updateUserPassword(req, res, next);

                expect(updatePasswordStub.calledOnceWith({ id: req.params.id, oldPassword: req.body.oldPassword, newPassword: req.body.newPassword })); expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith({ message: "Password changed successfully" })).to.be.true;
            });
        });
        describe("deleteUser() => :", () => {
            it("expect delete user from dataBase", async () => {
                const req = { params: { userId: 3 } };
                const deleteUser = sinon.stub(UserService, "deleteUser").resolves({ message: "Successful delete" });

                await UserController.deleteUser(req, res, next);

                expect(deleteUser.calledOnceWith(req.params.userId)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith({ message: "Successful delete" })).to.be.true;
            })
        })
    });
    describe("Negative tests", () => {
        describe("getUserAccount() =>", () => {
            it("expect error('User not found'), when it don't exist", async () => {
                const req = { params: { userId: 3 } };
                const getRoleUserByIdStub = sinon.stub(UserService, "getUserById").rejects(new Error("User not found"));

                await UserController.getUserAccount(req, res, next);

                expect(getRoleUserByIdStub.calledOnceWith(req.params.userId)).to.be.true;
                expect(next.called).to.be.true;
                expect(next.calledOnceWith(new Error("User not found")));
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            })
        });
        describe("updateUserPassword()", () => {
            it("expect next('Valid data error')", async () => {
                const req = { body: { oldPassword: "", newPassword: "" }, user: { id: "" } };
                const updatePasswordStub = sinon.stub(UserService, "updatePassword");

                await UserController.updateUserPassword(req, res, next);

                expect(updatePasswordStub.called).to.be.false;
                expect(next.called).to.be.true;
                expect(next.calledOnceWith(new Error("Valid data error")));
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            });
            it("expect next('Service Error')", async () => {
                const req = { body: { oldPassword: "old", newPassword: "new" }, user: { id: "id" } };
                const error = new Error("Service Error")
                const updatePasswordStub = sinon.stub(UserService, "updatePassword").rejects(error);

                await UserController.updateUserPassword(req, res, next);

                expect(updatePasswordStub.calledOnceWith({ id: req.params, oldPassword: req.body.oldPassword, newPassword: req.body.newPassword }));
                expect(next.called).to.be.true;
                expect(next.calledOnceWith(error)).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            })
        });
        describe("deleteUser() => Delete:", () => {
            it("expect message: 'Delete error', when delete user service from dataBase", async () => {
                const req = { params: { userId: 3 } };
                const deleteUser = sinon.stub(UserService, "deleteUser").rejects(new Error("Delete error"));

                await UserController.deleteUser(req, res, next);

                expect(deleteUser.calledOnceWith(req.params.userId)).to.be.true;
                expect(next.called).to.be.true;
                expect(next.calledOnceWith(new Error("Delete error")));
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            })
        });
    });
});