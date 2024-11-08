require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const db = require("../../../src/models");
const PostService = require("../../../src/services/postService");

use(chaiAsPromised);

describe("Post Service", () => {
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive tests", () => {
        describe("PostCreate() =>", () => {
            it("expect post to be created and return, when data is valid", async () => {
                const testPost = { phone: "FOO", title: "FOO", content: "FOO" };
                const findByPkStub = sinon.stub(db.Categories, "findByPk").resolves(true);
                const createStub = sinon.stub(db.Posts, "create").resolves({ ...testPost, id: 1 });

                const result = await PostService.createPost(1, testPost);

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(createStub.calledOnceWith({ ...testPost, category_id: 1 })).to.be.true;
                expect(result).to.deep.equals({ ...testPost, id: 1 });
            });
        });
        describe("getAllPosts() =>", () => {
            it("expect all Posts from db, when when they exist", async () => {
                const testPost = { content: "FOO" };
                const findAllStub = sinon.stub(db.Posts, "findAll").resolves([{ ...testPost, id: 1 }]);

                const result = await PostService.getAllPosts();

                expect(findAllStub.calledOnceWith()).to.be.true;
                expect(result).that.is.a("array");
                expect(result[0]).to.deep.equals({ ...testPost, id: 1 });
            });
        });
        describe("updatePost =>", () => {
            it("expend Post to be updated, when it exists and valid data", async () => {
                let testPost = { id: 1, content: "FOO" };
                const updateStub = sinon.stub(db.Posts, "update");
                const findByPkStub = sinon.stub(db.Posts, "findByPk").resolves({ testPost, update: updateStub });
                let updatePost = { id: 1, content: "FOO" };
                updateStub.resolves(updatePost);
                const result = await PostService.updatePost(1, testPost);

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(updateStub.calledOnceWith(testPost)).to.be.true;
                expect(result).to.deep.include(updatePost);
            });
        });
        describe("deletePost() =>", () => {
            it("expend to delete Post, when it exists", async () => {
                const destroyStub = sinon.stub(db.Posts, "destroy").resolves();
                const findByPkStub = sinon.stub(db.Posts, "findByPk").resolves({ destroy: destroyStub });

                const result = await PostService.deletePost(1);

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(destroyStub.calledOnce).to.be.true;
                expect(result).to.deep.equals({ message: "Successful delete" });
            });
        })
    });
    describe("Negative tests", () => {
        describe("PostCreate() =>", () => {
            let findByPkStub, createStub;
            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Categories, "findByPk");
                createStub = sinon.stub(db.Posts, "create");
            });
            it("expend error('Category not found'), when error with db", async () => {
                let testPost = { id: 1, content: "FOO" };
                findByPkStub.resolves(null);

                await expect(PostService.createPost(1, testPost)).to.be.rejectedWith(Error, "Category not found");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(createStub.calledOnceWith(testPost)).to.be.false;
            });
            it("expend error('Create Error'), when error with db", async () => {
                let testPost = { id: 1, content: "FOO" };
                findByPkStub.resolves(true);
                createStub.rejects(new Error("Create Error"))

                await expect(PostService.createPost(1, testPost)).to.be.rejectedWith(Error, "Create Error");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(createStub.calledOnceWith({ ...testPost, category_id: 1 })).to.be.true;
            });
        });
        describe("getAllPosts() =>", () => {
            it("expend error('Find Error'), when error with db", async () => {
                let testPost = { id: 1, content: "FOO" };
                const findAllStub = sinon.stub(db.Posts, "findAll").rejects(new Error("Find Error"));

                await expect(PostService.getAllPosts(testPost)).to.be.rejectedWith(Error, "Find Error");

                expect(findAllStub.calledOnce).to.be.true;
            });
        });
        describe("сделать getPostsByCategory() =>", () => {
            // it("expend error('Find Error'), when error with db", async () => {
            //     let testPost = { id: 1, content: "FOO" };
            //     const findAllStub = sinon.stub(db.Posts, "findAll").rejects(new Error("Find Error"));

            //     await expect(PostService.getPostsByCategory(testPost)).to.be.rejectedWith(Error, "Find Error");

            //     expect(findAllStub.calledOnce).to.be.true;
            // });
        });
        describe("updatePost =>", () => {
            let findByPkStub, updateStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Posts, "findByPk");
                updateStub = sinon.stub(db.Posts, "update");
            });

            it("expend error('Post not found'), when Post doesn't exist", async () => {
                let testPost = { id: 1, content: "FOO" };
                findByPkStub.resolves(null);

                await expect(PostService.updatePost(1, testPost)).to.be.rejectedWith(Error, "Post not found");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(updateStub.calledOnce).to.be.false;
            });
            it("expend  error('Update Error'), when error with db", async () => {
                let testPost = { id: 1, content: "FOO" };
                findByPkStub.resolves({ testPost, update: updateStub });
                updateStub.rejects(new Error("Update Error"));

                await expect(PostService.updatePost(1, testPost)).to.be.rejectedWith(Error, "Update Error");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(updateStub.calledOnceWith(testPost)).to.be.true;
            });
        });
        describe("deletePost() =>", () => {
            let findByPkStub, destroyStub
            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Posts, "findByPk");
                destroyStub = sinon.stub(db.Posts, "destroy");
            })
            it("expend error('Post not found'), when error with db", async () => {
                findByPkStub.resolves(null);

                await expect(PostService.deletePost(1)).to.be.rejectedWith(Error, "Post not found");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(destroyStub.calledOnce).to.be.false;
            });
            it("expend error('Find Error'), when error with db", async () => {
                findByPkStub.resolves({ destroy: destroyStub });
                destroyStub.rejects(new Error("Destroy Error"));

                await expect(PostService.deletePost(1)).to.be.rejectedWith(Error, "Destroy Error");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(destroyStub.calledOnce).to.be.true;
            });
        });
    });
});