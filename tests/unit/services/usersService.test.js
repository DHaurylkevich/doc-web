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
        describe("createUser() => :", () => {
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
        describe("getUserById() =>: ", () => {
            let findByPkStub;
            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Users, "findByPk");
            });
            it("expect user, when it exists", async () => {
                const user = { id: 1, name: "Foo" };
                findByPkStub.resolves(user);

                const result = await UserService.getUserById(1);

                expect(findByPkStub.calledWith(1)).to.be.true;
                expect(result).to.deep.equal(user);
            });
        });
        describe("findUserByParam() =>:", () => {
            it("expect user by email or phone or pesel from DB successfully, when user exists", async () => {
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
            it("expect clinic by email or phone from DB successfully, when clinic exists", async () => {
                const clinicData = { id: 1, name: "FOO", email: "FOO" };
                findOneUserStub = sinon.stub(db.Users, "findOne").resolves(false);
                findOneClinicStub = sinon.stub(db.Clinics, "findOne").resolves(clinicData);

                const user = await UserService.findUserByParam(clinicData.email);

                expect(findOneUserStub.calledOnceWith({
                    where: {
                        [Op.or]: [
                            { email: clinicData.email },
                            { phone: clinicData.email },//Возможно не надо
                            { pesel: clinicData.email }
                        ]
                    }
                })).to.be.true;
                expect(findOneClinicStub.calledOnceWith({
                    where: {
                        [Op.or]: [
                            { email: clinicData.email },
                            { phone: clinicData.email },//Возможно не надо
                        ]
                    }
                })).to.be.true;
                expect(user).to.be.a("object").to.deep.include(clinicData);
            });
        });
        describe("getRoleUserById() => :", () => {
            let findOneStub;
            beforeEach(async () => {
                findOneStub = sinon.stub(db.Users, "findOne");
            });

            it("expect user and patient, when it exists", async () => {
                findOneStub.resolves({ id: 1, name: "FOO" });

                const result = await UserService.getRoleUserById(1, "patient");

                expect(findOneStub.calledOnceWith({ where: { id: 1 }, include: [db.Patients] }))
                expect(result).to.deep.equals({ id: 1, name: "FOO" });
            });
            it("expect user and doctor data, when it exists", async () => {
                findOneStub.resolves({ id: 1, name: "FOO" });

                const result = await UserService.getRoleUserById(1, "admin");

                expect(findOneStub.calledOnceWith({ where: { id: 1 }, include: [db.Patients] }))
                expect(result).to.deep.equals({ id: 1, name: "FOO" });
            });
            it("expect user and admin data, when it exists", async () => {
                const findByPkStub = sinon.stub(db.Users, "findByPk").resolves({ id: 1, name: "FOO" });

                const result = await UserService.getRoleUserById(1, "admin");

                expect(findByPkStub.calledOnceWith({ where: { id: 1 }, include: [db.Patients] }))
                expect(result).to.deep.equals({ id: 1, name: "FOO" });
            });
        })
        describe("updateUser: => :", () => {
            let findByPkUserStub, updateUserStub, transactionStub;
            beforeEach(async () => {
                findByPkUserStub = sinon.stub(db.Users, "findByPk")
                transactionStub = sinon.stub(sequelize, "transaction").resolves();
                updateUserStub = sinon.stub(db.Users, "update")
            })
            it("expect to update user and get updated user data successfully, when user exists and has a valid data,", async () => {
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
        });
        describe("updatePassword: => :", () => {
            it("expect to change and hash password, when user exists, valid data", async () => {
                const user = { id: 1, password: faker.internet.password() }
                const newPassword = faker.internet.password();
                const checkingPassStub = sinon.stub(passwordUtil, "checkingPassword").resolves(true);
                const findByPkStub = sinon.stub(db.Users, "findByPk").resolves(user);
                const updateStub = sinon.stub(db.Users, "update").resolves(1);

                await UserService.updatePassword(user.id, user.password, newPassword);

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(checkingPassStub.calledOnceWith(user.password, user.password)).to.be.true;
                expect(updateStub.calledOnceWith({ password: { newPassword } })).to.be.false;
            })
        });
        describe("Delete user", () => {
            it("expect to delete user data from DB successfully, when user exists", async () => {
                const destroyUserStub = sinon.stub().resolves();
                const user = { destroy: destroyUserStub };
                findByPkUserStub = sinon.stub(db.Users, "findByPk").resolves(user);

                await UserService.deleteUser(1);

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
                expect(destroyUserStub.calledOnce).to.be.true;
            });
        });
    });
    describe("Negative tests", () => {
        afterEach(async () => {
            sinon.restore();
        });
        describe("createUser() => :", () => {
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
        describe("getUserById() => :", () => {
            it("expect Error('User not found'), when user don't exist", async () => {
                const findOneUserStub = sinon.stub(db.Users, "findByPk").resolves(false);

                await expect(UserService.getUserById(1)).to.be.rejectedWith(Error, "User not found");

                expect(findOneUserStub.calledOnce).to.be.true;
            });
        });
        describe("getRoleUserById() => :", () => {
            it("expect Error('Invalid role specified'), when role don't exists", async () => {
                await expect(UserService.getRoleUserById(1, "FOO")).to.be.rejectedWith(Error, "Invalid role specified");
            });
            it("expect Error('User not found'), when role don't exists", async () => {
                findOneStub = sinon.stub(db.Users, "findOne").resolves(false);

                await expect(UserService.getRoleUserById(1, "patient")).to.be.rejectedWith(Error, "User not found");

                expect(findOneStub.calledOnce).to.be.true;
            });
        });
        describe("findUserByParam() => :", () => {
            it("expect Error('User not found'), when user and clinic with param don't exist", async () => {
                const findOneUserStub = sinon.stub(db.Users, "findOne").resolves(false);
                const findOneClinicStub = sinon.stub(db.Clinics, "findOne").resolves(false);

                await expect(UserService.findUserByParam("")).to.be.rejectedWith(Error, "User not found");

                expect(findOneUserStub.calledOnce).to.be.true;
                expect(findOneClinicStub.calledOnce).to.be.true;
            });
        });
        describe("updateUser() => :", () => {
            it("expect Error('User not found'), when user don't exist", async () => {
                findByPkUserStub = sinon.stub(db.Users, "findByPk").resolves(false);

                await expect(UserService.updateUser(1, {})).to.be.rejectedWith(Error, "User not found");

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
            });
        });
        describe("updatePassword() => :", () => {
            it("expect Error('User not found'), when user don't exist", async () => {
                findByPkUserStub = sinon.stub(db.Users, "findByPk").resolves(false);

                await expect(UserService.updatePassword(1, "", "")).to.be.rejectedWith(Error, "User not found");

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
            });
            it("expect Error('Password Error'), when password not equal", async () => {
                const userData = { id: 1, password: "hashedOldPassword" };
                findByPkUserStub = sinon.stub(db.Users, "findByPk").resolves(userData);
                const checkingPassStub = sinon.stub(passwordUtil, "checkingPassword").throws(new Error("Password Error"));

                await expect(UserService.updatePassword(1, "wrongOldPassword", "newPassword")).to.be.rejectedWith(Error, "Password Error");

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
                expect(checkingPassStub.calledOnceWith("wrongOldPassword", "hashedOldPassword")).to.be.true;
            });
        });
        describe("deleteUser() => :", () => {
            it("expect Error('User not found'), when user don't exist", async () => {
                findByPkUserStub = sinon.stub(db.Users, "findByPk").resolves(false);

                await expect(UserService.deleteUser(1)).to.be.rejectedWith(Error, "User not found");

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
            });
        });
    });
});