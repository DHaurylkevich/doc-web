require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
// const { faker } = require('@faker-js/faker');
const UserController = require("../../../src/controllers/userController");
const UserService = require("../../../src/services/userService");
const authMiddleware = require("../../../src/middleware/auth");
const passwordUtil = require("../../../src/utils/passwordUtil");

use(chaiAsPromised);

describe("Users Controller", () => {
    describe("Positive tests", () => {
        let next, res;
        beforeEach(async () => {
            next = sinon.stub();
            res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
        })
        describe("registerUser()", () => {

            afterEach(async () => {
                sinon.restore();
            });
            it("Expect create user with token JWT and return status 201, when valid data is provide", async () => {
                const req = { body: { role: "patient" } };
                const createdUser = { id: 1, ...req.body };
                const createUserStub = sinon.stub(UserService, "createUser").resolves(createdUser);
                const createJwtStub = sinon.stub(authMiddleware, "createJWT").returns("fake-jwt-token");

                await UserController.registerUser(req, res, next);

                expect(createUserStub.calledOnceWith(req.body)).to.be.true;
                expect(createJwtStub.calledOnceWith(createdUser.id, createdUser.role)).to.be.true;
                expect(res.status.calledOnceWith(201)).to.be.true;
                expect(res.json.calledOnceWith("fake-jwt-token")).to.be.true;
                expect(next.called).to.be.false;
            });
        });
        describe("loginUser", () => {
            it("Expect login user with JWT token and return status 200, when valid data is provide", async () => {
                const req = { body: { email: "", password: "pass" } };
                const foundUser = { id: 1, email: "", password: "hashPass", role: "" };
                const findByEmailStub = sinon.stub(UserService, "findUserByEmail").resolves(foundUser);
                const checkingPassStub = sinon.stub(passwordUtil, "checkingPassword").resolves(true);
                const createJwtStub = sinon.stub(authMiddleware, "createJWT").returns("fake-jwt-token");

                await UserController.loginUser(req, res, next);

                expect(findByEmailStub.calledOnceWith(req.body.email)).to.be.true;
                expect(checkingPassStub.calledOnceWith(req.body.password, foundUser.password)).to.be.true;
                expect(createJwtStub.calledOnceWith(foundUser.id, foundUser.role)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith("fake-jwt-token")).to.be.true;
                expect(next.called).to.be.false;
            })
        })
    });
    describe("Negative tests", () => {
        describe("registerUser()", () => {
            let next, res, req;
            beforeEach(async () => {
                next = sinon.stub();
                req = { body: { name: "" } };
                res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            })

            afterEach(async () => {
                sinon.restore();
            });
            it("Expect next('Error occurred'), when createUser fails", async () => {
                const error = new Error("Error occurred");
                const createUserStun = sinon.stub(UserService, "createUser").rejects(error);

                await UserController.registerUser(req, res, next);

                expect(next.calledOnceWith(error)).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            });
            it("Expect next('Token create error'), when createJwt fails", async () => {
                const newUser = { id: "1", role: "" }
                const error = new Error("Token create error");
                const createUserStun = sinon.stub(UserService, "createUser").resolves(newUser);
                const createJwtStub = sinon.stub(authMiddleware, "createJWT").throws(error);

                await UserController.registerUser(req, res, next);

                expect(next.calledOnceWith(error)).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            })
        });
        describe("loginUser()", () => {
            let next, res, req;
            beforeEach(async () => {
                next = sinon.stub();
                req = { body: { email: "", password: "pass" } };
                res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            })

            afterEach(async () => {
                sinon.restore();
            });
            it("Expect next('User not found'), when the user not found", async () => {
                const error = new Error("User not found");
                const findByEmailStub = sinon.stub(UserService, "findUserByEmail").rejects(error);

                await UserController.loginUser(req, res, next);

                expect(next.calledOnceWith(error)).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            });
            it("Expect next('Login Error'), when the passwords are different", async () => {
                const error = new Error("Login Error");
                const foundUser = { id: 1, email: "", password: "hashPass", role: "" };
                const findByEmailStub = sinon.stub(UserService, "findUserByEmail").resolves(foundUser);
                const checkingPassStub = sinon.stub(passwordUtil, "checkingPassword").returns(false);

                await UserController.loginUser(req, res, next);

                expect(next.calledOnceWith(error)).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            });
            it("Expect next('Token Error'), when the passwords are different", async () => {
                const error = new Error("Token Error");
                const foundUser = { id: 1, email: "", password: "hashPass", role: "" };
                const findByEmailStub = sinon.stub(UserService, "findUserByEmail").resolves(foundUser);
                const checkingPassStub = sinon.stub(passwordUtil, "checkingPassword").returns(false);
                const createJwtStub = sinon.stub(authMiddleware, "createJWT").returns("fake-jwt-token");
                await UserController.loginUser(req, res, next);


                expect(next.calledOnceWith(error)).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            })
        })
    })

});

