const db = require("../models");
const AppError = require("../utils/appError");

const PostService = {
    createPost: async (categoryId, postData) => {
        try {
            const category = await db.Categories.findByPk(categoryId);
            if (!category) {
                throw new AppError("Category not found", 404);
            }

            const post = await db.Posts.create({ ...postData, category_id: categoryId });
            return post;
        } catch (err) {
            throw err;
        }
    },
    getAllPosts: async () => {
        try {
            return await db.Posts.findAll();
        } catch (err) {
            throw err;
        }
    },
    getPostsByCategory: async (categoryId) => {
        try {
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
        } catch (err) {
            throw err;
        }
    },
    updatePost: async (postId, data) => {
        try {
            let post = await db.Posts.findByPk(postId);
            if (!post) {
                throw new AppError("Post not found", 404);
            }

            return await post.update(data);
        } catch (err) {
            throw err;
        }
    },
    deletePost: async (postId) => {
        try {
            let post = await db.Posts.findByPk(postId);
            if (!post) {
                throw new AppError("Post not found", 404);
            }

            await post.destroy();
            return { message: "Successful delete" };
        } catch (err) {
            throw err;
        }
    }
}

module.exports = PostService;