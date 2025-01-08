const db = require("../models");
const AppError = require("../utils/appError");

const NotionService = {
    createNotion: async (notionData) => {

        const notion = await db.Notions.create(notionData);
        return notion
    },
    getAllNotions: async () => {
        const notions = await db.Notions.findAll();
        return notions;
    },
    updateNotion: async (notionId, notionData) => {
        let notion = await db.Notions.findByPk(notionId);
        if (!notion) {
            throw new AppError("Notion not found");
        }

        notion = await notion.update(notionData);

        return notion;
    },
    deleteNotion: async (notionId) => {
        let notion = await db.Notions.findByPk(notionId);
        if (!notion) {
            throw new AppError("Notion not found");
        }

        await notion.destroy();
    }
};

module.exports = NotionService;