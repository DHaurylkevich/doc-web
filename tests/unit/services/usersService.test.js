require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { Op } = require("sequelize");
const { faker } = require('@faker-js/faker');
const db = require("../../../src/models");
const sequelize = require("../../../src/config/db");
const UserService = require("../../../src/services/userService");
const passwordUtil = require("../../../src/utils/passwordUtil");

use(chaiAsPromised);

describe("Users Service", () => {
    describe("Positive tests", () => {
        describe("Create new user", () => {
            beforeEach(async () => {
                transactionStub = sinon.stub(sequelize, "transaction").resolves();
                createUserStub = sinon.stub(db.Users, "create");
                findOneUserStub = sinon.stub(db.Users, "findOne");
            })
            afterEach(async () => {
                sinon.restore();
            });

            it("when user has a valid data, expect user to be created with transaction and return user data with hash password", async () => {
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
                findUsersStub = sinon.stub(db.Users, "findAll").resolves([userData]);

                const user = await UserService.findUsers();

                expect(findUsersStub.calledOnce).to.be.true;
                expect(user).to.be.a("array").that.deep.include(userData);
            });
            it("When user is in DB, expect to get user by email or phone or pesel from DB successfully", async () => {
                const userData = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    password: faker.internet.password(),
                    phone: faker.phone.number(),
                    role: "doctor",
                    center_id: 1,
                };
                findOneUserStub = sinon.stub(db.Users, "findOne").resolves(userData);

                const user = await UserService.findUserByParam(userData.email);

                expect(findOneUserStub.calledOnceWith({
                    where: {
                        [Op.or]: [
                            { email: userData.email },
                            { phone: userData.email },//Возможно не надо
                            { pesel: userData.email }
                        ]
                    }
                })).to.be.true;
                expect(user).to.be.a("object").to.deep.include(userData);
            });
        });
        describe("Update user", () => {
            let findByPkUserStub, updateUserStub;

            beforeEach(async () => {
                findByPkUserStub = sinon.stub(db.Users, "findByPk")
                updateUserStub = sinon.stub(db.Users, "update")
            })
            afterEach(async () => {
                sinon.restore();
            });
            it("when user is in DB and has a valid data, expect to update user and get updated user data successfully", async () => {
                const user = { id: 1, email: faker.internet.email() };
                const updatedData = { email: faker.internet.email() };
                findByPkUserStub.resolves(user);
                updateUserStub.resolves({ ...user, ...updatedData });

                const updatedUser = await UserService.updateUser(1, updatedData);

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
                expect(updateUserStub.calledOnceWith(updatedData)).to.be.true;
                expect(updatedUser.email).to.equal(updatedData.email);;
            });
            it("updatePassword", async () => {
                const user = { id: 1, password: faker.internet.password() }
                const newPassword = faker.internet.password();
                const checkingPassStub = sinon.stub(passwordUtil, "checkingPassword").resolves(true);
                findByPkUserStub.resolves(user);
                updateUserStub.resolves(1);

                await UserService.updatePassword(user.id, user.password, newPassword);

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
                expect(checkingPassStub.calledOnceWith(user.password, user.password)).to.be.true;
                expect(updateUserStub.calledOnceWith({ password: { newPassword } })).to.be.false;
            })
        });
        describe("Delete user", () => {
            afterEach(async () => {
                sinon.restore();
            })

            it("When user is in DB, expect to delete user data from DB successfully", async () => {
                const destroyUserStub = sinon.stub().resolves();
                const user = { id: 1, email: faker.internet.email(), password: faker.internet.password(), destroy: destroyUserStub };
                findByPkUserStub = sinon.stub(db.Users, "findByPk").resolves(user);

                const result = await UserService.deleteUser(1);

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
                expect(destroyUserStub.calledOnce).to.be.true;
                expect(result).to.deep.equal({ message: "Successful delete" });
            });
        });
    });
    describe("Error tests", () => {
        afterEach(async () => {
            sinon.restore();
        });
        describe("Create user", () => {
            beforeEach(async () => {
                createUserStub = sinon.stub(db.Users, "create");
                findUserStub = sinon.stub(db.Users, "findOne");
            })
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
        describe("findUserByParam() => Get user by param(email):", () => {
            it("when user is not in DB, expect Error with 'User not found'", async () => {
                findOneUserStub = sinon.stub(db.Users, "findOne").resolves(false);

                await expect(UserService.findUserByParam("")).to.be.rejectedWith(Error, "User not found");

                expect(findOneUserStub.calledOnce).to.be.true;
            });
        });
        describe("updateUser() => Update user:", () => {
            it("when user is not in DB, expect Error with 'User not found'", async () => {
                findByPkUserStub = sinon.stub(db.Users, "findByPk").resolves(false);

                await expect(UserService.updateUser(1, {})).to.be.rejectedWith(Error, "User not found");

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
            });
        });
        describe("updatePassword() => Update user:", () => {
            it("when user is not in DB, expect Error with 'User not found'", async () => {
                findByPkUserStub = sinon.stub(db.Users, "findByPk").resolves(false);

                await expect(UserService.updatePassword(1, "", "")).to.be.rejectedWith(Error, "User not found");

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
            });
            it("when password not equal, expect Error with 'Password Error'", async () => {
                const userData = { id: 1, password: "hashedOldPassword" };
                findByPkUserStub = sinon.stub(db.Users, "findByPk").resolves(userData);
                const checkingPassStub = sinon.stub(passwordUtil, "checkingPassword").throws(new Error("Password Error"));

                await expect(UserService.updatePassword(1, "wrongOldPassword", "newPassword")).to.be.rejectedWith(Error, "Password Error");

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
                expect(checkingPassStub.calledOnceWith("wrongOldPassword", "hashedOldPassword")).to.be.true;
            });
        });
        describe("deleteUser() => Delete user:", () => {
            it("When user is not in DB, expect Error with 'User not found'", async () => {
                findByPkUserStub = sinon.stub(db.Users, "findByPk").resolves(false);

                await expect(UserService.deleteUser(1)).to.be.rejectedWith(Error, "User not found");

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
            });
        });
    });
});