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
    afterEach(async () => {
        sinon.restore();
    });
    describe("Positive tests", () => {
        // describe("registerUser()", () => {
        //     it("Expect create user with token JWT and return status 201, when valid data is provide", async () => {
        //         const req = { body: { role: "patient" } };
        //         const createdUser = { id: 1, ...req.body };
        //         const createUserStub = sinon.stub(UserService, "createUser").resolves(createdUser);
        //         const createJwtStub = sinon.stub(authMiddleware, "createJWT").returns("fake-jwt-token");

        //         await UserController.registerUser(req, res, next);

        //         expect(createUserStub.calledOnceWith(req.body)).to.be.true;
        //         expect(createJwtStub.calledOnceWith(createdUser.id, createdUser.role)).to.be.true;
        //         expect(res.status.calledOnceWith(201)).to.be.true;
        //         expect(res.json.calledOnceWith("fake-jwt-token")).to.be.true;
        //         expect(next.called).to.be.false;
        //     });
        // });
        describe("loginUser", () => {
            afterEach(async () => {
                sinon.restore();
            });
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
        describe("updateUserPassword()", () => {
            afterEach(async () => {
                sinon.restore();
            });
            it("Expect changed password and return message, when valid data is provide", async () => {
                const req = { body: { oldPassword: "old", newPassword: "new" }, params: { id: "1" } };
                const updatePasswordStub = sinon.stub(UserService, "updatePassword").resolves();

                await UserController.updateUserPassword(req, res, next);

                expect(updatePasswordStub.calledOnceWith({ id: req.params, oldPassword: req.body.oldPassword, newPassword: req.body.newPassword }));
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith({ message: "Password changed successfully" })).to.be.true;
            });
        });
        // describe("updateUser", () => {
        //     it("Expect update user data", async () => {
        //         const req = { body: { userData } };

        //     })
        // })
    });
    describe("Negative tests", () => {
        // describe("registerUser()", () => {
        //     let req, createUserStun;
        //     beforeEach(async () => {
        //         req = { body: { name: "" } };
        //         createUserStun = sinon.stub(UserService, "createUser")
        //     });
        //     it("Expect next('Error occurred') from createUser(), when the service createUser() throws an error", async () => {
        //         const error = new Error("Error occurred");
        //         createUserStun.rejects(error);

        //         await UserController.registerUser(req, res, next);

        //         expect(next.calledOnceWith(error)).to.be.true;
        //         expect(res.status.called).to.be.false;
        //         expect(res.json.called).to.be.false;
        //     });
        //     it("Expect next('Token create error') from createJWT(), when createJWT() throws an error", async () => {
        //         const newUser = { id: "1", role: "" };
        //         const error = new Error("Token create error");
        //         createUserStun.resolves(newUser);
        //         sinon.stub(authMiddleware, "createJWT").throws(error);

        //         await UserController.registerUser(req, res, next);

        //         expect(next.calledOnceWith(error)).to.be.true;
        //         expect(res.status.called).to.be.false;
        //         expect(res.json.called).to.be.false;
        //     });
        // });
        describe("loginUser()", () => {
            let req, findByParamStub;
            beforeEach(async () => {
                req = { body: { email: "", password: "pass" } };
                findByParamStub = sinon.stub(UserService, "findUserByParam");
            });
            afterEach(async () => {
                sinon.restore();
            });
            it("Expect next('User not found') from findByParamStub(), when the user not found", async () => {
                const error = new Error("User not found");
                findByParamStub.rejects(error);

                await UserController.loginUser(req, res, next);

                expect(next.calledOnceWith(error)).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            });
            it("Expect next('Login Error') from checkingPassword(), when passwords do not match", async () => {
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
            afterEach(async () => {
                sinon.restore();
            });
            it("Исправить next Expect next('Service Error')", async () => {
                const req = { body: { oldPassword: "", newPassword: "" }, params: { id: "id" } };
                const error = new Error("Service Error");
                const updatePasswordStub = sinon.stub(UserService, "updatePassword").rejects(error);

                await UserController.updateUserPassword(req, res, next);

                expect(updatePasswordStub.calledOnceWith({ id: req.params, oldPassword: req.body.oldPassword, newPassword: req.body.newPassword }));
                // expect(next.calledOnceWith(error)).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            })
            it("Expect next('Valid data error')", async () => {
                const req = { body: { oldPassword: "", newPassword: "" }, params: { id: "" } };
                const updatePasswordStub = sinon.stub(UserService, "updatePassword");

                await UserController.updateUserPassword(req, res, next);

                expect(updatePasswordStub.called).to.be.false;
                expect(next.called).to.be.true;
                expect(next.calledOnceWith("Valid data error"));
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            })
        });
    });
});

