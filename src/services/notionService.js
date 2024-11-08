const db = require("../models");

const NotionService = {
    createNotion: async (notionData) => {
        try {
            const notion = await db.Notions.create(notionData);
            return notion
        } catch (err) {
            throw err;
        }
    },
    getAllNotions: async () => {
        try {
            const notions = await db.Notions.findAll();
            return notions;
        } catch (err) {
            throw err;
        }
    },
    updateNotion: async (notionId, notionData) => {
        try {
            let notion = await db.Notions.findByPk(notionId);
            if (!notion) {
                throw new Error("Notion not found");
            }

            notion = await notion.update(notionData);

            return notion;
        } catch (err) {
            throw err;
        }
    },
    deleteNotion: async (tagId) => {
        try {
            let notion = await db.Notions.findByPk(tagId);
            if (!notion) {
                throw new Error("Notion not found");
            }

            await notion.destroy();
            return { message: "Successful delete" };
        } catch (err) {
            throw err;
        }
    }
}

module.exports = NotionService;