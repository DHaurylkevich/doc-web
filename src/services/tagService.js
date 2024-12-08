const db = require("../models");
const AppError = require("../utils/appError");


const tagService = {
    createTag: async (tagData) => {
        try {
            return await db.Tags.create(tagData);
        } catch (err) {
            throw err;
        }
    },
    getAllTags: async () => {
        try {
            return await db.Tags.findAll();
        } catch (err) {
            throw err;
        }
    },
    updateTag: async (tagId, tagData) => {
        try {
            let tag = await db.Tags.findByPk(tagId);
            if (!tag) {
                throw new AppError("Tag not found", 404);
            }

            tag = await tag.update(tagData);

            return tag;
        } catch (err) {
            throw err;
        }
    },
    deleteTag: async (tagId) => {
        try {
            let tag = await db.Tags.findByPk(tagId);
            if (!tag) {
                throw new AppError("Tag not found", 404);
            }

            await tag.destroy();
        } catch (err) {
            throw err;
        }
    }
}

module.exports = tagService;