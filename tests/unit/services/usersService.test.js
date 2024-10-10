require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { faker } = require('@faker-js/faker');
const { users } = require("../../../src/models").models;
const sequelize = require("../../../src/config/db");
const UserService = require("../../../src/services/userService");

use(chaiAsPromised);

describe("Users Service", () => {
    describe("Positive tests", () => {
        describe("Create new user", () => {
            beforeEach(async () => {
                transactionStub = sinon.stub(sequelize, "transaction").resolves();
                createUserStub = sinon.stub(users, "create");
                findOneUserStub = sinon.stub(users, "findOne");
            })

            afterEach(async () => {
                sinon.restore();
            });

            it("when user has a valid data, expect user to be created with transaction and return user data", async () => {
                const passwordTrue = faker.internet.password();
                const newUser = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    phone: faker.phone.number(),
                    password: passwordTrue,
                    role: "patient",
                    birthday: faker.date.birthdate(),
                };
                createUserStub.resolves(newUser);
                findOneUserStub.resolves(false);

                const user = await UserService.createUser(newUser, transactionStub);

                expect(createUserStub.calledOnceWith(newUser)).to.be.true;
                expect(user.password).to.not.equal(passwordTrue);
                expect(user).to.be.a("object").that.deep.include(newUser);
            });
        });
        describe("Get user/users", () => {
            afterEach(async () => {
                sinon.restore();
            });
            it("Expect to get users from DB successfully", async () => {
                const userData = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    password: faker.internet.password(),
                    phone: faker.phone.number(),
                    role: "doctor",
                    center_id: 1,
                };
                findUsersStub = sinon.stub(users, "findAll").resolves([userData]);

                const user = await UserService.findUsers();

                expect(findUsersStub.calledOnce).to.be.true;
                expect(user).to.be.a("array").that.deep.include(userData);
            });
            it("When user is in DB, expect to get user from DB successfully", async () => {
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

                expect(findOneUserStub.calledOnceWith({ where: { email: userData.email } })).to.be.true;
                expect(user).to.be.a("object").to.deep.include(userData);
            });
        });
        describe("Update user", () => {
            afterEach(async () => {
                sinon.restore();
            });
            it("when user is in DB and has a valid data, expect to update user and get updated user data successfully", async () => {
                const user = { id: 1, email: faker.internet.email(), password: faker.internet.password() };
                const updatedData = { email: faker.internet.email(), password: faker.internet.password() }
                findByPkUserStub = sinon.stub(users, "findByPk").resolves(user);
                updateUserStub = sinon.stub(users, "update").resolves({ ...user, ...updatedData });

                const updatedUser = await UserService.updateUser(1, updatedData);

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
                expect(updateUserStub.calledOnceWith(updatedData)).to.be.true;
                expect(updatedUser.email).to.equal(updatedData.email);
                expect(updatedUser.password).to.equal(updatedData.password);
            });
        });
        describe("Delete user", () => {
            afterEach(async () => {
                sinon.restore();
            })

            it("When user is in DB, expect to delete user data from DB successfully", async () => {
                const destroyUserStub = sinon.stub().resolves();
                const user = { id: 1, email: faker.internet.email(), password: faker.internet.password(), destroy: destroyUserStub };
                findByPkUserStub = sinon.stub(users, "findByPk").resolves(user);

                const result = await UserService.deleteUser(1);

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
                expect(destroyUserStub.calledOnce).to.be.true;
                expect(result).to.deep.equal({ message: "Successful delete" });
            });
        });
    });
    describe("Error tests", () => {
        describe("Create user", () => {
            beforeEach(async () => {
                createUserStub = sinon.stub(users, "create");
                findUserStub = sinon.stub(users, "findOne");
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
                findUserStub.resolves({ email: newUser.email });

                await expect(UserService.createUser(newUser)).to.be.rejectedWith(Error, "User already exist");

                expect(findUserStub.calledWith({ where: { email: newUser.email } })).to.be.true;
                expect(createUserStub.notCalled).to.be.true;
            });
        });
        describe("Get user by email", () => {
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

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
            });
        });
        describe("Delete user", () => {
            afterEach(async () => {
                sinon.restore();
            })

            it("When user is not in DB, expect Error with 'User not found'", async () => {
                findByPkUserStub = sinon.stub(users, "findByPk").resolves(false);

                await expect(UserService.deleteUser(1)).to.be.rejectedWith(Error, "User not found");

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
            });
        });
    });
});