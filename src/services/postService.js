const db = require("../models");
const AppError = require("../utils/appError");
const { getPaginationParams, getTotalPages } = require("../utils/pagination");

const PostService = {
    createPost: async (categoryId, postData) => {
        const category = await db.Categories.findByPk(categoryId);
        if (!category) {
            throw new AppError("Category not found", 404);
        }

        const post = await db.Posts.create({ ...postData, category_id: categoryId });
        return { id: post.id, photo: post.photo, title: post.title, content: post.content };
    },
    getAllPosts: async (limit, page) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);

        const { rows, count } = await db.Posts.findAndCountAll({
            limit: parsedLimit,
            offset: offset,
            attributes: { exclude: ["createdAt", "updatedAt", "category_id"] },
            include: [
                {
                    model: db.Categories,
                    as: "category",
                    attributes: ["name"],
                }
            ],
        });
        if (!rows.length) {
            return { pages: 0, posts: [] };
        }

        const totalPages = getTotalPages(count, parsedLimit, page);

        const groupedPosts = rows.reduce((accumulator, post) => {
            const categoryName = post.category.name;
            if (!accumulator[categoryName]) {
                accumulator[categoryName] = [];
            }
            accumulator[categoryName].push(post);
            return accumulator;
        }, {});

        return { pages: totalPages, posts: groupedPosts };
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