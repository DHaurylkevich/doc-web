const db = require("../models");
const AppError = require("../utils/appError");

const CategoryService = {
    createCategory: async (categoryData) => {
        return await db.Categories.create(categoryData);
    },
    getAllCategories: async () => {
        return await db.Categories.findAll();
    },
    updateCategory: async (categoryId, data) => {
        let category = await db.Categories.findByPk(categoryId);
        if (!category) {
            throw new AppError("Category not found", 404);
        }

        category = await category.update(data);

        return category;
    },
    deleteCategory: async (categoryId) => {
        const category = await db.Categories.findByPk(categoryId);
        if (!category) {
            throw new AppError("Category not found", 404);
        }

        await category.destroy();
    }
}

module.exports = CategoryService;