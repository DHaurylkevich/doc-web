const db = require("../models");

const tagService = {
    createTag: async (tagData) => {
        try {
            const tag = await db.Tags.create(tagData);
            return tag
        } catch (err) {
            throw err;
        }
    },
    getAllTags: async () => {
        try {
            const tags = await db.Tags.findAll();
            if (!tags) {
                throw new Error("Tags not found");
            }

            return tags;
        } catch (err) {
            throw err;
        }
    },
    updateTag: async (tagId, tagData) => {
        try {
            let tag = await db.Tags.findByPk(tagId);
            if (!tag) {
                throw new Error("Tag not found");
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
                throw new Error("Tag not found");
            }

            await tag.destroy();
        } catch (err) {
            throw err;
        }
    }
}

module.exports = tagService;