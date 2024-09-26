require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
// const sequelize = require("../../src/config/db");
const { faker } = require('@faker-js/faker');
const { users, medical_centers } = require("../../src/models").models;
const UserService = require("../../src/services/userService");

use(chaiAsPromised);

describe("Users Service", () => {
    describe("Positive test", () => {
        describe("Create new user", () => {
            beforeEach(async () => {
                createUserStub = sinon.stub(users, "create");
            })

            afterEach(async () => {
                sinon.restore();
            });

            it("when user has valid data and role 'patient', expect user to be create", async () => {
                const newUser = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    password: faker.internet.password(),
                    phone: faker.phone.number(),
                    role: "patient",
                    center_id: null,
                };
                createUserStub.resolves(newUser);

                const user = await UserService.createUser(newUser);

                expect(createUserStub.calledWith(newUser)).to.be.true;
                expect(user).to.be.a("object").that.deep.include(newUser);
                expect(user.password).to.not.equal(newUser.password);
            });

            it("when user has valid data and role 'doctor', expect user to be create", async () => {
                const newUser = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    password: faker.internet.password(),
                    phone: faker.phone.number(),
                    role: "doctor",
                    center_id: 1,
                };
                const fakeCenter = {
                    center_id: 1,
                    name: faker.person.firstName(),
                };
                findCenterStub = sinon.stub(medical_centers, "findOne");
                findCenterStub.resolves(fakeCenter);
                createUserStub.resolves(newUser);

                const user = await UserService.createUser(newUser);

                expect(findCenterStub.calledWith({ where: { center_id: 1 } })).to.be.true;
                expect(createUserStub.calledWith(newUser)).to.be.true;

                expect(user).to.be.a("object").that.deep.include(newUser);
                expect(user.password).to.not.equal(newUser.password);

            });
        });
    });
    describe("Error test", () => {
        describe("Create user", () => {
            beforeEach(async () => {
                createUserStub = sinon.stub(users, "create");
            })

            afterEach(async () => {
                sinon.restore();
            });

            it("when email already is in DB, expect Error with User already exist", async () => {
                const newUser = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    password: faker.internet.password(),
                    phone: faker.phone.number(),
                    role: "doctor",
                    center_id: 2,
                }

                findUserStub = sinon.stub(users, "findOne").resolves({ email: newUser.email });

                await expect(UserService.createUser(newUser)).to.be.rejectedWith(Error, "User already exist");

                expect(findUserStub.calledWith({ where: { email: newUser.email } })).to.be.true;
                expect(createUserStub.notCalled).to.be.true;
            });

            it("when user is doctor and has invalid center_id, expect Error with Medical center not found", async () => {
                const newUser = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    password: faker.internet.password(),
                    phone: faker.phone.number(),
                    role: "doctor",
                    center_id: 2,
                }
                findUserStub = sinon.stub(users, "findOne").resolves(false);
                findCenterStub = sinon.stub(medical_centers, "findOne").resolves(null);

                await expect(UserService.createUser(newUser)).to.be.rejectedWith(Error, "Medical center not found");

                expect(findCenterStub.calledWith({ where: { center_id: 2 } })).to.be.true;
                expect(createUserStub.notCalled).to.be.true;
            })
        });
    });
});