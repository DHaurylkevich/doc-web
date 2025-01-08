const db = require("../models");
const AppError = require("../utils/appError");

const PostService = {
    createPost: async (categoryId, postData) => {
        const category = await db.Categories.findByPk(categoryId);
        if (!category) {
            throw new AppError("Category not found", 404);
        }

        const post = await db.Posts.create({ ...postData, category_id: categoryId });
        return post;
    },
    getAllPosts: async () => {
        return await db.Posts.findAll();
    },
    getPostsByCategory: async (categoryId) => {
        return await db.Posts.findAll({
            include: [
                {
                    model: db.Categories,
                    as: "category",
                    where: { id: categoryId },
                    attribute: ["id", "name"],
                }
            ],
            attributes: ["id", "photo", "title", "content", "createdAt"]
        });
    },
    updatePost: async (postId, data) => {
        const post = await db.Posts.findByPk(postId);
        if (!post) {
            throw new AppError("Post not found", 404);
        }

        return await post.update(data);
    },
    deletePost: async (postId) => {
        const post = await db.Posts.findByPk(postId);
        if (!post) {
            throw new AppError("Post not found", 404);
        }

        await post.destroy();
    }
}

module.exports = PostService;