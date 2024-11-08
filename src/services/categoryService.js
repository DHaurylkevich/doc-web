const db = require("../models");

const CategoryService = {
    createCategory: async (categoryData) => {
        try {
            const category = await db.Categories.create(categoryData);
            return category
        } catch (err) {
            throw err;
        }
    },
    getAllCategories: async () => {
        try {
            const category = await db.Categories.findAll();
            return category;
        } catch (err) {
            throw err;
        }
    },
    updateCategory: async (categoryId, data) => {
        try {
            let category = await db.Categories.findByPk(categoryId);
            if (!category) {
                throw new Error("Category not found");
            }

            category = await category.update(data);

            return category;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    deleteCategory: async (categoryId) => {
        try {
            let category = await db.Categories.findByPk(categoryId);
            if (!category) {
                throw new Error("Category not found");
            }

            await category.destroy();
            return { message: "Successful delete" };
        } catch (err) {
            throw err;
        }
    }
}

module.exports = CategoryService;