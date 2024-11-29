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
const deleteFromCloud = require("../../../src/middleware/upload");

use(chaiAsPromised);

describe("Users Service", () => {
    afterEach(async () => {
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
                expect(createUserStub.calledOnceWith({ ...newUser }, { transaction: transactionStub })).to.be.true;
                expect(user).to.be.an('object');
                expect(user).to.have.property('id', 1);
                expect(user).to.have.property('role', 'patient');
            });
        });
        describe("findAllUsers() =>: ", () => {
            let findAllStub;
            beforeEach(async () => {
                findAllStub = sinon.stub(db.Users, "findAll");
            });
            it("expect to return all users, when they exist", async () => {
                const users = [{ id: 1, name: "Foo" }, { id: 2, name: "Bar" }];
                findAllStub.resolves(users);

                const result = await UserService.findAllUsers();

                expect(findAllStub.calledOnce).to.be.true;
                expect(result).to.deep.equal(users);
            });
        });
        describe("getUserById() =>: ", () => {
            let findByPkStub;
            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Users, "findByPk");
            });
            it("expect to return user, when it exists", async () => {
                const user = { id: 1, name: "Foo" };
                findByPkStub.resolves(user);

                const result = await UserService.getUserById(1);

                expect(findByPkStub.calledWith(1)).to.be.true;
                expect(result).to.deep.equal(user);
            });
        });
        describe("findUserByParam() =>:", () => {
            let findOneUserStub;
            beforeEach(async () => {
                findOneUserStub = sinon.stub(db.Users, "findOne");
            });
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
                findOneUserStub.resolves(userData);

                const user = await UserService.findUserByParam(userData.email);

                expect(findOneUserStub.calledOnceWith({
                    where: {
                        [Op.or]: [
                            { email: userData.email },
                            { phone: userData.email },
                            { pesel: userData.email }
                        ]
                    }
                })).to.be.true;
                expect(user).to.be.a("object").to.deep.include(userData);
            });
            it("expect clinic by email or phone from DB successfully, when clinic exists", async () => {
                const clinicData = { id: 1, name: "FOO", email: "FOO" };
                findOneUserStub.resolves(false);
                findOneClinicStub = sinon.stub(db.Clinics, "findOne").resolves(clinicData);

                const user = await UserService.findUserByParam(clinicData.email);

                expect(findOneUserStub.calledOnceWith({
                    where: {
                        [Op.or]: [
                            { email: clinicData.email },
                            { phone: clinicData.email },
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
        describe("updateUser() => :", () => {
            let findByPkUserStub, updateUserStub, transactionStub, deleteFromCloudStub;
            beforeEach(async () => {
                findByPkUserStub = sinon.stub(db.Users, "findByPk");
                transactionStub = sinon.stub(sequelize, "transaction").resolves();
                updateUserStub = sinon.stub(db.Users, "update");
                deleteFromCloudStub = sinon.stub(deleteFromCloud, "deleteFromCloud").resolves();
            })
            it("expect to update user with new image and get updated user data successfully, when user exists and has a valid data", async () => {
                const id = 1;
                const oldImage = "old_image_url";
                const newImage = "new_image_url";
                const updatedData = {
                    email: faker.internet.email()
                };
                const user = {
                    id: 1,
                    photo: oldImage,
                    update: updateUserStub
                };
                findByPkUserStub.resolves(user);
                updateUserStub.resolves(user);

                const updatedUser = await UserService.updateUser(newImage, id, updatedData, transactionStub);

                expect(findByPkUserStub.calledOnceWith(id)).to.be.true;
                expect(deleteFromCloudStub.calledOnceWith(oldImage)).to.be.true;
                expect(updateUserStub.calledOnceWith(
                    { ...updatedData, photo: newImage },
                    { transaction: transactionStub, returning: true }
                )).to.be.true;
                expect(updatedUser).to.equal(user);
            });
            it("expect to update user without changing image, when user exists and has a valid data", async () => {
                const id = 1;
                const currentImage = "current_image_url";
                const updatedData = {
                    email: faker.internet.email()
                };

                const user = {
                    photo: currentImage,
                    update: updateUserStub
                };

                findByPkUserStub.resolves(user);
                updateUserStub.resolves(user);

                const updatedUser = await UserService.updateUser(currentImage, id, updatedData, transactionStub);

                expect(findByPkUserStub.calledOnceWith(id)).to.be.true;
                expect(deleteFromCloudStub.called).to.be.false;
                expect(updateUserStub.calledOnceWith(
                    updatedData,
                    { transaction: transactionStub, returning: true }
                )).to.be.true;
                expect(updatedUser).to.equal(user);
            });
        });
        describe("updatePassword() => :", () => {
            let findByPkStub, updateStub;
            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Users, "findByPk");
                updateStub = sinon.stub();
            })
            it("expect to change and hash password, when user exists, valid data", async () => {
                const user = { id: 1, password: faker.internet.password(), update: updateStub };
                const newPassword = faker.internet.password();
                findByPkStub.resolves(user);
                updateStub.resolves({ id: 1, password: "hashedPassword" });

                const updatedUser = await UserService.updatePassword(user.id, user.password, newPassword);

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(updateStub.calledOnce).to.be.true;
                expect(updatedUser).to.deep.not.equal({ password: user.password });
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
        describe("updateUser() => :", () => {
            let findByPkUserStub, deleteFromCloudStub, transactionStub;
            beforeEach(async () => {
                transactionStub = sinon.stub(sequelize, "transaction").resolves();
                findByPkUserStub = sinon.stub(db.Users, "findByPk");
                deleteFromCloudStub = sinon.stub(deleteFromCloud, "deleteFromCloud");
            })
            it("expect Error('User not found'), when user don't exist", async () => {
                findByPkUserStub.resolves(false);

                await expect(UserService.updateUser("image", 1, {})).to.be.rejectedWith(Error, "User not found");

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
                expect(deleteFromCloudStub.notCalled).to.be.true;
            });
            it("expect Error('Delete image error'), when error deleting image", async () => {
                const user = { id: 1, photo: "old-image.jpg" };
                findByPkUserStub.resolves(user);
                deleteFromCloudStub.rejects(new Error("Delete image error"));

                await expect(UserService.updateUser("new-image.jpg", 1, {}, transactionStub)).to.be.rejectedWith(Error, "Delete image error");

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
                expect(deleteFromCloudStub.calledOnceWith(user.photo)).to.be.true;
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

                await expect(UserService.updatePassword(1, "wrongOldPassword", "newPassword")).to.be.rejectedWith(Error, "Password Error");

                expect(findByPkUserStub.calledOnceWith(1)).to.be.true;
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