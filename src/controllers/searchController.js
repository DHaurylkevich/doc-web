const SearchService = require("../services/searchService");

//TODO: query валидация 400
const SearchController = {
    searchPosts: async (req, res, next) => {
        try {
            const { query, page, limit } = req.query;

            const result = await SearchService.searchPosts(query, page, limit);

            res.json(result);
        } catch (err) {
            next(err);
        }
    },
    searchPatients: async (req, res, next) => {
        try {
            const { query, page, limit } = req.query;
            const user = req.user;

            const result = await SearchService.searchPatients(query, page, limit, user);

            res.json(result);
        } catch (err) {
            next(err);
        }
    },
    searchDoctors: async (req, res, next) => {
        try {
            const { query, page, limit } = req.query;
            const user = req.user;

            const result = await SearchService.searchDoctors(query, page, limit, user);

            res.json(result);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = SearchController;