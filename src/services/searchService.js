
const { Op } = require("sequelize");
const db = require("../models");

const SearchService = {
    searchPosts: async (query, page, limit) => {
        const parsedLimit = Math.max(parseInt(limit) || 10, 1);
        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const offset = (pageNumber - 1) * parsedLimit;
        const words = query.split(" ");
        const queryWhere = words.map(word => "%" + word + "%");

        try {
            const { rows, count } = await db.Posts.findAndCountAll({
                offset,
                limit: parsedLimit,
                where: {
                    [Op.or]: [
                        {
                            title: {
                                [Op.iLike]: {
                                    [Op.all]: queryWhere,
                                },
                            }
                        },
                        {
                            content: {
                                [Op.iLike]: {
                                    [Op.all]: queryWhere,
                                },
                            }
                        },
                        {
                            '$category.name$': {
                                [Op.iLike]: {
                                    [Op.all]: queryWhere,
                                },
                            }
                        }
                    ]
                },
                include: [
                    {
                        model: db.Categories,
                        as: "category",
                        attributes: ["name"]
                    }
                ]
            });
            const totalPages = Math.ceil(count / parsedLimit);

            return { posts: rows, pages: totalPages };
        } catch (err) {
            throw err;
        }
    },
    searchPatient: async () => { },
};

module.exports = SearchService;