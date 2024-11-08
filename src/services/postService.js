const db = require("../models");

const PostService = {
    createPost: async (categoryId, postData) => {
        try {
            const category = await db.Categories.findByPk(categoryId);
            if (!category) {
                throw new Error("Category not found");
            }

            const post = await db.Posts.create({ ...postData, category_id: categoryId });
            return post;
        } catch (err) {
            throw err;
        }
    },
    getAllPosts: async () => {
        try {
            const posts = await db.Posts.findAll();
            if (!posts) {
                throw new Error("Posts not found");
            }

            return posts;
        } catch (err) {
            throw err;
        }
    },
    getPostsByCategory: async (categoryId) => {
        try {
            const posts = await db.Posts.findAll({
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

            return posts;
        } catch (err) {
            throw err;
        }
    },
    updatePost: async (postId, data) => {
        try {
            let post = await db.Posts.findByPk(postId);
            if (!post) {
                throw new Error("Post not found");
            }

            post = await post.update(data);

            return post;
        } catch (err) {
            throw err;
        }
    },
    deletePost: async (postId) => {
        try {
            let post = await db.Posts.findByPk(postId);
            if (!post) {
                throw new Error("Post not found");
            }

            await post.destroy();
            return { message: "Successful delete" };
        } catch (err) {
            throw err;
        }
    }
}

module.exports = PostService;