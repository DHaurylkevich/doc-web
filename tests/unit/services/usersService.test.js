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
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive tests", () => {
        describe("createUser() => Create new user:", () => {
            let transactionStub, findOneUserStub, createUserStub;
            beforeEach(async () => {
                transactionStub = sinon.stub(sequelize, "transaction").resolves();
                findOneUserStub = sinon.stub(db.Users, "findOne");
                createUserStub = sinon.stub(db.Users, "create");
            })
            it("expect user to be created with transaction and return user data with hash password, when user has a valid data and transaction", async () => {
                const newUser = { pesel: "12345678901", password: "password" };
                const createdUser = { id: 1, role: "patient" };
                findOneUserStub.resolves(false);
                createUserStub.resolves(createdUser);

                const user = await UserService.createUser(newUser, transactionStub);

                expect(findOneUserStub.calledOnceWith({ where: { pesel: newUser.pesel } })).to.be.true;
                expect(user).to.deep.equal(createdUser);
            });
        });
        describe("Get user/users", () => {
            describe("findUserById() =>", () => {
                let findByPkStub, getPatientsStub, getAddressesStub;
                beforeEach(async () => {
                    findByPkStub = sinon.stub(db.Users, "findByPk");
                    getPatientsStub = sinon.stub();
                    getAddressesStub = sinon.stub();
                })
                it("expect return user and address when user is a patient", async () => {
                    const userMock = { id: 1, role: "patient", getPatients: getPatientsStub };
                    const patientMock = { getAddresses: getAddressesStub };
                    const addressMock = { street: "123 Main St" };
                    findByPkStub.resolves(userMock);
                    getPatientsStub.resolves(patientMock);
                    getAddressesStub.resolves(addressMock);

                    const result = await UserService.findUserById(1);

                    expect(findByPkStub.calledWith(1)).to.be.true;
                    expect(getPatientsStub.calledOnce).to.be.true;
                    expect(getAddressesStub.calledOnce).to.be.true;
                    expect(result).to.deep.equal({ userByRole: patientMock, address: addressMock });
                });
            });
            describe("findUserByParam() =>", () => {
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
        });
        describe("Update user", () => {
            let findByPkUserStub, updateUserStub, transactionStub;
            beforeEach(async () => {
                findByPkUserStub = sinon.stub(db.Users, "findByPk")
                transactionStub = sinon.stub(sequelize, "transaction").resolves();
                updateUserStub = sinon.stub(db.Users, "update")
            })
            it("when user is in DB and has a valid data, expect to update user and get updated user data successfully", async () => {
                const id = 1;
                const updatedData = { email: faker.internet.email() };
                const user = { update: updateUserStub }
                findByPkUserStub.resolves(user);
                updateUserStub.resolves({ id, ...updatedData });

                const updatedUser = await UserService.updateUser(id, updatedData, transactionStub);

                expect(findByPkUserStub.calledOnceWith(id)).to.be.true;
                expect(updateUserStub.calledOnceWith(updatedData)).to.be.true;
                expect(updatedUser).to.equal(user);
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
            it("When user is in DB, expect to delete user data from DB successfully", async () => {
                const destroyUserStub = sinon.stub().resolves();
                const user = { destroy: destroyUserStub };
                findByPkUserStub = sinon.stub(db.Users, "findByPk").resolves(user);

                const result = await UserService.deleteUser(1);

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
                expect(destroyUserStub.calledOnce).to.be.true;
                expect(result).to.deep.equal({ message: "Successful delete" });
            });
        });
    });
    describe("Negative tests", () => {
        describe("createUser() => Create user", () => {
            let transactionStub, createUserStub, findUserStub;
            beforeEach(async () => {
                transactionStub = sinon.stub(sequelize, "transaction").resolves();
                createUserStub = sinon.stub(db.Users, "create");
                findUserStub = sinon.stub(db.Users, "findOne");
            })
            it("expect Error('User already exist'), when pesel already is in DB", async () => {
                const newUser = { pesel: "12345678" };
                findUserStub.resolves(newUser);

                await expect(UserService.createUser(newUser, transactionStub)).to.be.rejectedWith(Error, "User already exist");

                expect(findUserStub.calledWith({ where: { pesel: newUser.pesel } })).to.be.true;
                expect(createUserStub.notCalled).to.be.true;
            });
            it("expect Error('Create error'), when DB has error", async () => {
                const newUser = { pesel: "12345678", password: "FOO" };
                findUserStub.resolves(false);
                createUserStub.rejects(new Error("Create error"))

                await expect(UserService.createUser(newUser, transactionStub)).to.be.rejectedWith(Error, "Create error");

                expect(findUserStub.calledWith({ where: { pesel: newUser.pesel } })).to.be.true;
                expect(createUserStub.calledOnce).to.be.true;
            });
        });
        describe("findUserByParam() => Get user by param(email):", () => {
            afterEach(async () => {
                sinon.restore();
            });
            it("when user is not in DB, expect Error with 'User not found'", async () => {
                const findOneUserStub = sinon.stub(db.Users, "findOne").resolves(false);

                await expect(UserService.findUserByParam("")).to.be.rejectedWith(Error, "User not found");

                expect(findOneUserStub.calledOnce).to.be.true;
            });
        });
        describe("findUserById() => Get user by id:", () => {
            afterEach(async () => {
                sinon.restore();
            });
            it("when user is not in DB, expect Error with 'User not found'", async () => {
                const findOneUserStub = sinon.stub(db.Users, "findByPk").resolves(false);

                await expect(UserService.findUserById(1)).to.be.rejectedWith(Error, "User not found");

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