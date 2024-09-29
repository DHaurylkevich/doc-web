require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { faker } = require('@faker-js/faker');
const UserController = require("../../../src/controllers/userController");
const UserService = require("../../../src/services/userService");

use(chaiAsPromised);

describe("Users Controller", () => {
    describe("Positive tests", () => {
        describe("registerUser()", () => {
            // beforeEach(async () => {
            //     createUserStub = sinon.stub(users, "create");
            //     findOneUserStub = sinon.stub(users, "findOne");
            // })

            afterEach(async () => {
                sinon.restore();
            });
            it("Expect create user and return status 201", async () => {
                const newUser = {
                    first_name: faker.person.firstName(), last_name: faker.person.lastName(), email: faker.internet.email(),
                    password: faker.internet.password(), phone: faker.phone.number(), role: "patient", center_id: null,
                };
                const req = { body: newUser };
                const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
                const createdUser = { user_id: 1, ...newUser };
                const createUserStub = sinon.stub(UserService, "createUser").resolves(createdUser);

                await UserController.registerUser(req, res);

                expect(createUserStub.calledOnceWith(req.body)).to.be.true;
                expect(res.status.calledOnceWith(201)).to.be.true;
                expect(res.json.calledOnceWith(createdUser)).to.be.true;
            })
        });
    })
});

