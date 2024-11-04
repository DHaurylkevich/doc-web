const tagService = require("../services/tagService");
const TagService = require("../services/tagService");

const TagController = {
    createTag: async (req, res, next) => {
        const tagData = req.body;

        try {
            const tag = await TagService.createTag(tagData);
            res.status(201).json(tag);
        } catch (err) {
            console.log(err)
            next(err);
        }
    },
    getAllTags: async (req, res, next) => {
        try {
            const tags = await tagService.getAllTags()
            res.status(200).json(tags);
        } catch (err) {
            console.log(err)
            next(err);
        }
    },
    updateTag: async (req, res, next) => {
        const { tagId } = req.params;
        const tagData = req.body;

        try {
            const updateTag = await tagService.updateTag(tagId, tagData);
            res.status(200).json(updateTag);
        } catch (err) {
            console.log(err)
            next(err);
        }
    },
    deleteTag: async (req, res, next) => {
        const { tagId } = req.params;

        try {
            await TagService.deleteTag(tagId);
            res.status(200).json({ message: "Successful delete" });
        } catch (err) {
            console.log(err)
            next(err);
        }
    },
};

module.exports = TagController;