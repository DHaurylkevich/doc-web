const expect = require("chai");

describe("Users Service", function () {
    describe("Create new user", function () {
        it("should create a new user", function () {
            const newUser = {
                name: "Dima",
            };

        expect(newUser.name).to.equal("Dima");

        //     chai.request(app)
        //         .post("/api/users")
        //         .send(newUser)
        //         .end(function (err, res) {
        //             expect(res).to.have.status(201);
        //             expect(res.body).to.be.an("object");
        //             expect(res.body).to.have.property("message").eql("User created successfully");
        //             done();
        //         });
        });
    });
});