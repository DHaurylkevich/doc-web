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
                const passwordTrue = faker.internet.password();
                const newUser = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    password: passwordTrue,
                    phone: faker.phone.number(),
                    role: "patient",
                    center_id: null,
                };
                createUserStub.resolves(newUser);
                findOneUserStub = sinon.stub(users, "findOne").resolves(false);

                const user = await UserService.createUser(newUser);

                expect(createUserStub.calledWith(newUser)).to.be.true;
                expect(user.password).to.not.equal(passwordTrue);
                expect(user).to.be.a("object").that.deep.include(newUser);
            });

            it("when user has valid data and role 'doctor', expect user to be create", async () => {
                const passwordTrue = faker.internet.password();
                const newUser = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    password: passwordTrue,
                    phone: faker.phone.number(),
                    role: "doctor",
                    center_id: 1,
                };
                const fakeCenter = {
                    center_id: 1,
                    name: faker.person.firstName(),
                };
                findCenterStub = sinon.stub(medical_centers, "findOne").resolves(fakeCenter);
                findOneUserStub = sinon.stub(users, "findOne").resolves(false);
                createUserStub.resolves(newUser);

                const user = await UserService.createUser(newUser);

                expect(findCenterStub.calledWith({ where: { center_id: 1 } })).to.be.true;
                expect(createUserStub.calledWith(newUser)).to.be.true;
                expect(user).to.be.a("object").that.deep.include(newUser);
                expect(user.password).to.not.equal(passwordTrue);

            });
        });
        describe("Get user/users", () => {
            beforeEach(async () => {
                findUsersStub = sinon.stub(users, "findAll");
            })

            afterEach(async () => {
                sinon.restore();
            });
            it("Expect get users from DB successful", async () => {
                const userData = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    password: faker.internet.password(),
                    phone: faker.phone.number(),
                    role: "doctor",
                    center_id: 1,
                };
                findUsersStub.resolves([userData]);

                const user = await UserService.findUsers();

                expect(findUsersStub.calledOnce).to.be.true;
                expect(user).to.be.a("array").that.deep.include(userData);
            });
            it("When user has in DB, expect get user from DB successful", async () => {
                const userData = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    password: faker.internet.password(),
                    phone: faker.phone.number(),
                    role: "doctor",
                    center_id: 1,
                };
                findOneUserStub = sinon.stub(users, "findOne").resolves(userData);

                const user = await UserService.findUserByEmail(userData.email);

                expect(findOneUserStub.calledOnce).to.be.true;
                expect(user).to.be.a("object").to.deep.include(userData);
            });
        });
        describe("Update user", () => {
            beforeEach(async () => {
                updateUserStub = sinon.stub(users, "update");
            })

            afterEach(async () => {
                sinon.restore();
            });
            it("when user has in DB and has valid data, expect update user and get updated user successful", async () => {
                const user = {
                    id: 1,
                    email: faker.internet.email(),
                    password: faker.internet.password(),
                };
                const updatedData = { email: faker.internet.email(), password: faker.internet.password() }
                findByPkUserStub = sinon.stub(users, "findByPk").resolves(user);
                updateUserStub.resolves({ ...user, ...updatedData });

                const updatedUser = await UserService.updateUser(1, updatedData);

                expect(findByPkUserStub.calledOnce).to.be.true;
                expect(findByPkUserStub.calledWith(1)).to.be.true;
                expect(updateUserStub.calledOnce).to.be.true;
                expect(updateUserStub.calledWith(updatedData)).to.be.true;
                expect(updatedUser.email).to.equal(updatedData.email);
                expect(updatedUser.password).to.equal(updatedData.password);
            });
        })
    });
    describe("Error test", () => {
        describe("Create user", () => {
            beforeEach(async () => {
                createUserStub = sinon.stub(users, "create");
            })

            afterEach(async () => {
                sinon.restore();
            });

            it("when email already is in DB, expect Error with 'User already exist'", async () => {
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

            it("when user is doctor and has invalid center_id, expect Error with 'Medical center not found'", async () => {
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
        describe("Get user/users", () => {
            afterEach(async () => {
                sinon.restore();
            });
            it("when user is not in DB, expect Error with 'User not found'", async () => {
                findOneUserStub = sinon.stub(users, "findOne").resolves(false);

                await expect(UserService.findUserByEmail("")).to.be.rejectedWith(Error, "User not found");

                expect(findOneUserStub.calledOnce).to.be.true;
            });
        });
        describe("Update user", () => {
            afterEach(async () => {
                sinon.restore();
            });
            it("when user is not in DB, expect Error with 'User not found'", async () => {
                findByPkUserStub = sinon.stub(users, "findByPk").resolves(false);

                await expect(UserService.updateUser(1, {})).to.be.rejectedWith(Error, "User not found");

                expect(findByPkUserStub.calledOnce).to.be.true;
            });
        })
    });
});