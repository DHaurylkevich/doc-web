require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { faker } = require('@faker-js/faker');
const db = require("../../../src/models");
const sequelize = require("../../../src/config/db");
const UserService = require("../../../src/services/userService");
const PatientService = require("../../../src/services/patientService");
const AddressService = require("../../../src/services/addressService");
const AppError = require("../../../src/utils/appError");

use(chaiAsPromised);

describe("Patient Service", () => {
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive tests", () => {
        describe("createPatient() => :", () => {
            let transactionStub, createPatientStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                findOneUserStub = sinon.stub(db.Users, "findOne");
                createUserStub = sinon.stub(db.Users, "create");
                createPatientStub = sinon.stub();
            });
            it("expect user and patient to be created with transaction and return user data, when valid data", async () => {
                const userData = { email: faker.internet.email(), password: faker.internet.password() };
                const newUser = { id: 1, email: faker.internet.email() };
                findOneUserStub.resolves(null);
                createUserStub.resolves({ newUser, createPatient: createPatientStub });
                createPatientStub.resolves({ id: 1, user_id: 1 });

                const result = await PatientService.createPatient(userData);
                expect(findOneUserStub.calledOnceWith({
                    where: { email: newUser.email },
                    transaction: transactionStub
                }))
                expect(createUserStub.calledOnce).to.be.true;
                expect(createPatientStub.calledOnce).to.be.true;
                expect(result.newUser).to.deep.equals(newUser);
                expect(transactionStub.commit.calledOnce).to.be.true;
            });
        });
        describe("getPatientByParam() => :", () => {
            let findAllStub;

            beforeEach(() => {
                findAllStub = sinon.stub(db.Appointments, "findAll");
            });

            it("expect correctly apply 'sort':asc parameter for ascending order", async () => {
                const fakeAppointments = [
                    { id: 1, createdAt: new Date("2023-01-01") },
                    { id: 2, createdAt: new Date("2023-01-02") }
                ];
                findAllStub.resolves(fakeAppointments);

                const result = await PatientService.getPatientsByParam({
                    sort: 'asc',
                    limit: 10,
                    pages: 0,
                    doctorId: 1
                });

                expect(findAllStub.calledOnce).to.be.true;
                expect(findAllStub.firstCall.args[0].include[0].order).to.deep.equal([['first_name', 'ASC']]);
                expect(result).to.deep.equal(fakeAppointments);
            });

            it("expect correctly apply 'sort': desc parameter for descending order", async () => {
                const fakePatients = [
                    { id: 1, first_name: 'Alice' },
                    { id: 2, first_name: 'Bob' }
                ];
                findAllStub.resolves(fakePatients);

                const result = await PatientService.getPatientsByParam({
                    sort: 'desc',
                    limit: 10,
                    pages: 0,
                    doctorId: 1
                });

                expect(findAllStub.calledOnce).to.be.true;
                expect(findAllStub.firstCall.args[0].include[0].order).to.deep.equal([['first_name', 'DESC']]);
                expect(result).to.deep.equal(fakePatients);
            });

            it("expect correctly apply the limit parameter to restrict the number of results", async () => {
                const limit = 5;
                findAllStub.resolves([
                    { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }
                ]);

                const result = await PatientService.getPatientsByParam({
                    sort: 'asc',
                    limit: limit,
                    pages: 0,
                    doctorId: 1
                });

                expect(findAllStub.calledOnce).to.be.true;
                expect(findAllStub.firstCall.args[0].limit).to.equal(limit);
                expect(result.length).to.equal(limit);
            });

            it("expect correctly apply the pages parameter to restrict the number of results", async () => {
                const fakePatients = [
                    { id: 1, first_name: 'Alice' },
                    { id: 2, first_name: 'Bob' },
                    { id: 3, first_name: 'Charlie' },
                    { id: 4, first_name: 'David' },
                    { id: 5, first_name: 'Eve' }
                ];
                findAllStub.resolves(fakePatients.slice(2));

                const result = await PatientService.getPatientsByParam({
                    sort: 'asc',
                    limit: 3,
                    pages: 2,
                    doctorId: 1
                });

                expect(findAllStub.calledOnce).to.be.true;
                expect(findAllStub.firstCall.args[0].limit).to.equal(3);
                expect(findAllStub.firstCall.args[0].pages).to.equal(2);
                expect(result).to.have.lengthOf(3);
                expect(result[0].id).to.equal(3);
                expect(result[1].id).to.equal(4);
                expect(result[2].id).to.equal(5);
            });

            it('expect to return patients filtered by doctorId, when only doctorId is provided', async () => {
                const doctorId = 1;
                const fakePatients = [
                    {
                        id: 1,
                        user: {
                            id: 1,
                            first_name: 'John',
                            last_name: 'Doe',
                            photo: 'photo_url',
                            gender: 'male',
                            address: { city: 'Test City', street: 'Test Street' },
                        },
                        appointments: [
                            {
                                id: 1,
                                doctorService: { doctor_id: doctorId }
                            }
                        ]
                    }
                ];
                findAllStub.resolves(fakePatients);

                const result = await PatientService.getPatientsByParam({
                    sort: 'asc',
                    limit: 10,
                    pages: 0,
                    doctorId: doctorId
                });

                expect(findAllStub.calledOnce).to.be.true;
                expect(findAllStub.firstCall.args[0].include[1].where).to.deep.include({
                    doctor_id: doctorId
                });
                expect(result).to.deep.equal(fakePatients);
            });

            it('expect to return patients filtered by clinicId, when only clinicId is provided', async () => {
                const clinicId = 1;
                const fakePatients = [
                    {
                        id: 1,
                        user: {
                            id: 1,
                            first_name: 'John',
                            last_name: 'Doe',
                            photo: 'photo_url',
                            gender: 'male',
                            address: { city: 'Test City', street: 'Test Street' },
                        },
                        appointments: [
                            { id: 1, clinic_id: clinicId, doctorService: { doctor_id: 1 } }
                        ]
                    }
                ];
                findAllStub.resolves(fakePatients);

                const result = await PatientService.getPatientsByParam({
                    sort: 'asc',
                    limit: 10,
                    pages: 0,
                    clinicId: clinicId
                });

                expect(findAllStub.calledOnce).to.be.true;
                expect(findAllStub.firstCall.args[0].where).to.deep.equal({ clinic_id: clinicId });
                expect(findAllStub.firstCall.args[0].limit).to.equal(10);
                expect(findAllStub.firstCall.args[0].pages).to.equal(0);
                expect(findAllStub.firstCall.args[0].include[0].order).to.deep.equal([['first_name', 'ASC']]);
                expect(result).to.deep.equal(fakePatients);
            });
        });
        describe("getPatientById() => :", () => {
            it("expect return the correct patient data, when a valid userid", async () => {
                const userId = 1;
                const fakePatient = {
                    id: 1,
                    user: {
                        id: userId,
                        first_name: 'John',
                        last_name: 'Doe',
                        address: {
                            city: 'Test City',
                            street: 'Test Street'
                        }
                    }
                };
                const findOneStub = sinon.stub(db.Patients, "findOne").resolves(fakePatient);

                const result = await PatientService.getPatientById(userId);

                expect(findOneStub.calledOnce).to.be.true;
                expect(findOneStub.firstCall.args[0]).to.deep.include({
                    include: [
                        {
                            model: db.Users,
                            as: "user",
                            where: { id: userId },
                            include: [{ model: db.Addresses, as: 'address' }],
                        }
                    ]
                });
                expect(result).to.deep.equal(fakePatient);
            });
        });
        describe("updatePatient() => Update:", () => {
            let transactionStub, updateUserStub, updateAddressStub;

            beforeEach(() => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);

                updateUserStub = sinon.stub(UserService, "updateUser");
                updateAddressStub = sinon.stub(AddressService, "updateAddress");
            });

            it("expect to update Patient, User, and Address data successfully when data is valid", async () => {
                const image = "test_image.jpg";
                const userId = 1;
                const userData = { first_name: "John" };
                const addressData = { city: "Test City" };
                const fakeAddress = { id: 1 };
                const fakeUser = {
                    getAddress: sinon.stub().resolves(fakeAddress),
                    createAddress: sinon.stub().resolves(),
                };

                updateUserStub.resolves(fakeUser);

                const result = await PatientService.updatePatient(image, userId, userData, addressData);

                expect(updateUserStub.calledOnceWith(image, userId, userData, transactionStub)).to.be.true;
                expect(fakeUser.getAddress.calledOnce).to.be.true;
                expect(updateAddressStub.calledOnceWith(fakeAddress, addressData, transactionStub)).to.be.true;
                expect(transactionStub.commit.calledOnce).to.be.true;
                expect(transactionStub.rollback.called).to.be.false;
                expect(result).to.have.keys(["user", "address"]);
                expect(result.user).to.equal(fakeUser);
                expect(result.address).to.equal(fakeAddress);
            });

            it("expect to create a new address when no existing address is found and addressData is provided", async () => {
                const image = "test_image.jpg";
                const userId = 1;
                const userData = { first_name: "John" };
                const addressData = { city: "New City" };
                const fakeUser = {
                    getAddress: sinon.stub().resolves(null),
                    createAddress: sinon.stub().resolves({ id: 2, ...addressData }),
                };

                updateUserStub.resolves(fakeUser);

                const result = await PatientService.updatePatient(image, userId, userData, addressData);

                expect(updateUserStub.calledOnceWith(image, userId, userData, transactionStub)).to.be.true;
                expect(fakeUser.getAddress.calledOnce).to.be.true;
                expect(fakeUser.createAddress.calledOnceWith(addressData, transactionStub)).to.be.true;
                expect(transactionStub.commit.calledOnce).to.be.true;
                expect(transactionStub.rollback.called).to.be.false;
                expect(result).to.have.keys(["user", "address"]);
                expect(result.user).to.equal(fakeUser);
                expect(result.address).to.deep.equal({ id: 2, ...addressData });
            });
        });
    });
    describe("Error tests", () => {
        describe("createPatient() => :", () => {
            let transactionStub, createPatientStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                findOneUserStub = sinon.stub(db.Users, "findOne");
                createUserStub = sinon.stub(db.Users, "create");
                createPatientStub = sinon.stub();
            });
            it("expect Error('Need to enter the email'), when email don't enter", async () => {
                const userData = { password: "testPassword" };

                await expect(PatientService.createPatient(userData)).to.be.rejectedWith(AppError, "Need to enter the email");

                expect(transactionStub.commit.called).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
            });
            it("expect Error('User already exist'), when user with this email exists", async () => {
                const userData = { email: "test@example.com", password: "password123" };
                findOneUserStub.resolves({ id: 1, email: userData.email });

                await expect(PatientService.createPatient(userData)).to.be.rejectedWith(AppError, "User already exist");

                expect(transactionStub.commit.called).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
            });
        });
        describe("getPatientByParam() => :", () => {
            let findAllStub;

            beforeEach(() => {
                findAllStub = sinon.stub(db.Appointments, "findAll");
            });
            it("expect throw an error 'Either doctorId or clinicId is required', when neither doctorId nor clinicId is provided", async () => {
                const params = { sort: 'asc', limit: 10, pages: 0 };

                await expect(PatientService.getPatientsByParam(params))
                    .to.be.rejectedWith(AppError, "Either doctorId or clinicId is required");
            });
            it("expect throw an error'Either doctorId or clinicId is required', when neither doctorId nor clinicId is provided", async () => {
                const params = { sort: 'asc', limit: 10, pages: 0 };

                await expect(PatientService.getPatientsByParam(params))
                    .to.be.rejectedWith(AppError, "Either doctorId or clinicId is required");
            });
            it("expect throw any unexpected errors that occur during the database query", async () => {
                const clinicId = 1;
                const error = new Error("Database connection error");
                findAllStub.rejects(error);

                const params = {
                    sort: 'asc',
                    limit: 10,
                    pages: 0,
                    clinicId: clinicId
                };

                await expect(PatientService.getPatientsByParam(params)).to.be.rejectedWith(Error, "Database connection error");

                expect(findAllStub.calledOnce).to.be.true;
            });
        });
        describe("getPatientById() => :", () => {
            let findOneStub;
            beforeEach(() => {
                findOneStub = sinon.stub(db.Patients, "findOne").resolves(null);
            });
            it("expect throw an AppError('Patient not found'), with status 404 when patient is not found ", async () => {
                const userId = 1;
                findOneStub.resolves(null);

                await expect(PatientService.getPatientById(userId)).to.be.rejectedWith(AppError, "Patient not found");

                expect(findOneStub.calledOnce).to.be.true;
                expect(findOneStub.firstCall.args[0]).to.deep.include({
                    include: [
                        {
                            model: db.Users,
                            as: "user",
                            where: { id: userId },
                            include: [{ model: db.Addresses, as: 'address' }],
                        }
                    ]
                });
            });
            it("expect throw an AppError('Database query failed') by the database query ", async () => {
                const userId = 1;
                const error = new Error("Database query failed");
                findOneStub.rejects(error);

                await expect(PatientService.getPatientById(userId)).to.be.rejectedWith(Error, "Database query failed");

                expect(findOneStub.calledOnce).to.be.true;
                expect(findOneStub.firstCall.args[0]).to.deep.include({
                    include: [
                        {
                            model: db.Users,
                            as: "user",
                            where: { id: userId },
                            include: [{ model: db.Addresses, as: 'address' }],
                        }
                    ]
                });

                findOneStub.restore();
            });
        });
        describe("updatePatient() => Update:", () => {
            let transactionStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                updateUserStub = sinon.stub(UserService, "updateUser");
            })
            it("expect throw an AppError('User not found'), with status 404 when patient is not found", async () => {
                const image = "test_image.jpg";
                const userId = 1;
                const invalidUserData = { email: "invalid_email" };
                const patientData = { gender: "male" };
                const addressData = { city: "Test City" };
                updateUserStub.rejects(new AppError("User not found"));
                const fakeAddress = { id: 1 };
                const fakeUser = {
                    getAddress: sinon.stub().resolves(fakeAddress),
                    createAddress: sinon.stub().resolves(),
                };


                await expect(PatientService.updatePatient(image, userId, invalidUserData, patientData, addressData))
                    .to.be.rejectedWith(AppError, "User not found");

                expect(updateUserStub.calledOnceWith(image, userId, invalidUserData, transactionStub)).to.be.true;
                expect(transactionStub.commit.called).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
            });
            it("expect throw error and rolled back, when any error occurs", async () => {
                const image = "test_image.jpg";
                const userId = 1;
                const userData = { first_name: "John" };
                const patientData = { gender: "male" };
                const addressData = { city: "Test City" };
                const error = new Error("Test error");
                updateUserStub.rejects(error);

                await expect(PatientService.updatePatient(image, userId, userData, patientData, addressData))
                    .to.be.rejectedWith(Error, "Test error");

                expect(updateUserStub.calledOnceWith(image, userId, userData, transactionStub)).to.be.true;
                expect(transactionStub.commit.called).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
            });
        });

    });
});