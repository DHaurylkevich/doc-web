const PostService = require("../services/postService");

const PostController = {
    createPost: async (req, res, next) => {
        const { categoryId } = req.params;
        const postData = req.body;

        try {
            const post = await PostService.createPost(categoryId, postData);
            res.status(201).json(post);
        } catch (err) {
            console.log(err);
            next(err);
        }
    },
    getAllPosts: async (req, res, next) => {
        try {
            const post = await PostService.getAllPosts();
            res.status(200).json(post)
        } catch (err) {
            next(err);
        }
    },
    getPostsByCategory: async (req, res, next) => {
        const { categoryId } = req.params;
        try {
            const posts = await PostService.getPostsByCategory(categoryId);
            res.status(200).json(posts)
        } catch (err) {
            next(err);
        }
    },
    updatePost: async (req, res, next) => {
        const { postId } = req.params;
        const postData = req.body;

        try {
            const updatedPost = await PostService.updatePost(postId, postData);
            res.status(200).json(updatedPost);
        } catch (err) {
            next(err);
        }
    },
    deletePost: async (req, res, next) => {
        const { postId } = req.params;

        try {
            const result = await PostService.deletePost(postId);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = PostController;