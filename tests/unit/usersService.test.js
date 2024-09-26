require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect } = require("chai");
// const sequelize = require("../../src/config/db");
const { faker } = require('@faker-js/faker');
const { users, medical_centers } = require("../../src/models").models;
const userService = require("../../src/services/userService");

describe("Users Service", () => {
    describe("Positive test", () => {
        describe("Create new user", () => {
            beforeEach(async () => {
                createUserStub = sinon.stub(users, "create");
            })

            beforeEach(async () => {
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

                const user = await userService.createUser(newUser);
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

                const user = await userService.createUser(newUser);

                expect(findCenterStub.calledWith({ where: { center_id: 1 } })).to.be.true;
                expect(createUserStub.calledWith(newUser)).to.be.true;

                expect(user).to.be.a("object").that.deep.include(newUser);
                expect(user.password).to.not.equal(newUser.password);

            });
        });
    });
    describe("Error test", () => {
        describe("Create user", () => {
            it("when user is doctor and has invalid center_id", async () => {
                const newUser = {
                    first_name: faker.person.firstName(),
                    last_name: faker.person.lastName(),
                    email: faker.internet.email(),
                    password: faker.internet.password(),
                    phone: faker.phone.number(),
                    role: "doctor",
                    center_id: "",
                }




            })
        });
    });
});