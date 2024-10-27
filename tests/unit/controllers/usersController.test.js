require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const UserController = require("../../../src/controllers/userController");
const UserService = require("../../../src/services/userService");
const authMiddleware = require("../../../src/middleware/auth");
const passwordUtil = require("../../../src/utils/passwordUtil");

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
        describe("loginUser() =>", () => {
            it("Expect login user and return status 200 with JWT token, when valid data is provide", async () => {
                const req = { body: { loginParam: "", password: "pass" } };
                const foundUser = { id: 1, email: "", password: "hashPass", role: "patient" };
                const findByParamStub = sinon.stub(UserService, "findUserByParam").resolves(foundUser);
                const checkingPassStub = sinon.stub(passwordUtil, "checkingPassword").resolves(true);
                const createJwtStub = sinon.stub(authMiddleware, "createJWT").returns("fake-jwt-token");

                await UserController.loginUser(req, res, next);

                expect(findByParamStub.calledOnceWith(req.body.loginParam)).to.be.true;
                expect(checkingPassStub.calledOnceWith(req.body.password, foundUser.password)).to.be.true;
                expect(createJwtStub.calledOnceWith(foundUser.id, foundUser.role)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith("fake-jwt-token")).to.be.true;
                expect(next.called).to.be.false;
            });
        });
        describe("updateUserPassword() =>", () => {
            it("Expect changed password and return message, when valid data is provide", async () => {
                const req = { body: { oldPassword: "old", newPassword: "new" }, params: { id: "1" } };
                const updatePasswordStub = sinon.stub(UserService, "updatePassword").resolves();

                await UserController.updateUserPassword(req, res, next);

                expect(updatePasswordStub.calledOnceWith({ id: req.params.id, oldPassword: req.body.oldPassword, newPassword: req.body.newPassword })); expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith({ message: "Password changed successfully" })).to.be.true;
            });
        });
        describe("getUserById() =>", () => {
            it("Expect get user, when it exists", async () => {
                const req = { params: { id: 3 }, body: { role: "admin" } };
                const user = { id: 3, name: "FOO" }
                const getUserByIdStub = sinon.stub(UserService, "getRoleUserById").resolves(user);

                await UserController.getUserById(req, res, next);

                expect(getUserByIdStub.calledOnceWith(req.params.id)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith(user)).to.be.true;
            })
        })
        describe("deleteUser() => Delete:", () => {
            it("Expect delete user from dataBase", async () => {
                const req = { params: { id: 3 } };
                const deleteUser = sinon.stub(UserService, "deleteUser").resolves({ message: "Successful delete" });

                const result = await UserController.deleteUser(req, res, next);

                expect(deleteUser.calledOnceWith(req.params.id)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith({ message: "Successful delete" })).to.be.true;
            })
        })
    });
    describe("Negative tests", () => {
        describe("loginUser()", () => {
            let res, findByParamStub;
            beforeEach(async () => {
                res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
                findByParamStub = sinon.stub(UserService, "findUserByParam");
            });
            it("Expect next('User not found') from findByParamStub(), when the user not found", async () => {
                const req = { body: { email: "", password: "pass" } };
                const error = new Error("User not found");
                findByParamStub.rejects(error);

                await UserController.loginUser(req, res, next);

                expect(next.calledOnceWith(error)).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            });
            it("Expect next('Login Error') from checkingPassword(), when passwords do not match", async () => {
                const req = { body: { email: "", password: "pass" } };
                const foundUser = { id: 1, email: "", password: "hashPass", role: "" };
                const error = new Error("User not found");
                findByParamStub.resolves(foundUser);
                sinon.stub(passwordUtil, "checkingPassword").throws(error);

                await UserController.loginUser(req, res, next);

                expect(next.calledOnceWith(error)).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            });
            it("Expect next('Token Error') from createJWT(), when createJWT() throws an error", async () => {
                const req = { body: { email: "", password: "pass" } };
                const foundUser = { id: 1, email: "", password: "hashPass", role: "" };
                const error = new Error("Token Error");
                findByParamStub.resolves(foundUser);
                sinon.stub(passwordUtil, "checkingPassword");
                sinon.stub(authMiddleware, "createJWT").throws(error);

                await UserController.loginUser(req, res, next);

                expect(next.calledOnceWith(error)).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            });
        });
        describe("updateUserPassword()", () => {
            it("Expect next('Valid data error')", async () => {
                const req = { body: { oldPassword: "", newPassword: "" }, params: { id: "" } };
                const updatePasswordStub = sinon.stub(UserService, "updatePassword");

                await UserController.updateUserPassword(req, res, next);

                expect(updatePasswordStub.called).to.be.false;
                expect(next.called).to.be.true;
                expect(next.calledOnceWith(new Error("Valid data error")));
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            }),
                it("Expect next('Service Error')", async () => {
                    const req = { body: { oldPassword: "old", newPassword: "new" }, params: { id: "id" } };
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
        describe("getUserById() =>", () => {
            it("Expect error('User not found'), when it don't exist", async () => {
                const req = { params: { id: 3 } };
                const getUserByIdUser = sinon.stub(UserService, "getUserById").rejects(new Error("User not found"));

                await UserController.getUserById(req, res, next);

                expect(getUserByIdUser.calledOnceWith(req.params.id)).to.be.true;
                expect(next.called).to.be.true;
                expect(next.calledOnceWith(new Error("User not found")));
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            })
        });
        describe("deleteUser() => Delete:", () => {
            it("Expect message: 'Delete error', when delete user service from dataBase", async () => {
                const req = { params: { id: 3 } };
                const deleteUser = sinon.stub(UserService, "deleteUser").rejects(new Error("Delete error"));

                await UserController.deleteUser(req, res, next);

                expect(deleteUser.calledOnceWith(req.params.id)).to.be.true;
                expect(next.called).to.be.true;
                expect(next.calledOnceWith(new Error("Delete error")));
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            })
        });
    });
});