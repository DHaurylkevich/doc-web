const db = require("../models");
const AppError = require("../utils/appError");

const PostService = {
    createPost: async (categoryId, postData) => {
        const category = await db.Categories.findByPk(categoryId);
        if (!category) {
            throw new AppError("Category not found", 404);
        }

        const post = await db.Posts.create({ ...postData, category_id: categoryId });
        return { id: post.id, photo: post.photo, title: post.title, content: post.content };
    },
    getAllPosts: async () => {
        return await db.Posts.findAll(
            {
                attributes: { exclude: ["createdAt", "updatedAt", "category_id"] },
                include: [
                    {
                        model: db.Categories,
                        as: "category",
                        attributes: ["name"],
                    }
                ],
            });
    },
    getPostsByCategory: async (categoryId) => {
        return await db.Posts.findAll({
            attributes: ["id", "photo", "title", "content", "createdAt"],
            include: [
                {
                    model: db.Categories,
                    as: "category",
                    attributes: ["name"],
                    where: { id: categoryId },
                }
            ],
        });
    },
    updatePost: async (postId, postData) => {
        let post = await db.Posts.findByPk(postId);
        if (!post) {
            throw new AppError("Post not found", 404);
        }

        post = await post.update(postData);
        return { id: post.id, photo: post.photo, title: post.title, content: post.content }
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