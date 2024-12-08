const db = require("../models");
const AppError = require("../utils/appError");

const CategoryService = {
    createCategory: async (categoryData) => {
        try {
            return await db.Categories.create(categoryData);
        } catch (err) {
            throw err;
        }
    },
    getAllCategories: async () => {
        try {
            return await db.Categories.findAll();
        } catch (err) {
            throw err;
        }
    },
    updateCategory: async (categoryId, data) => {
        try {
            let category = await db.Categories.findByPk(categoryId);
            if (!category) {
                throw new AppError("Category not found", 404);
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
                throw new AppError("Category not found", 404);
            }

            await category.destroy();
            return { message: "Successful delete" };
        } catch (err) {
            throw err;
        }
    }
}

module.exports = CategoryService;