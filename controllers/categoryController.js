import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
export const createCategory = async (req, res) => {
    try {
        const { category } = req.body;
        if (!category) {
            return res.status(404).send({
                message: 'Please provide Category name.',
                success: false
            });
        }
        await categoryModel.create({ category })
        res.status(201).send({
            message: `${category} Category created successfully.`,
            success: true
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Error in Create Category API.',
            success: false,
            error
        })
    }
}

//get all categories
export const getAllCategoriesController = async (req, res) => {
    try {
        const categories = await categoryModel.find({});
        res.status(200).send({
            message: 'All Categories fetched successfully.',
            success: true,
            totalCat: categories.length,
            categories
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Error in Get all category API.',
            success: false,
            error
        })
    }
}

//delete category
export const deleteCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findById(req.params.id);
        if (!category) {
            return res.status(404).send({
                message: 'Category not found.',
                success: false
            });
        }
        //find product with this category id
        const products = await productModel.find({ category: category._id });
        //updte product category
        for (let index = 0; index < products.length; index++) {
            const product = products[index];
            product.category = undefined;
            await product.save();
        }
        //delete category
        await category.deleteOne();
        res.status(200).send({
            message: 'Category deleted successfully.',
            success: true
        })

    } catch (error) {
        console.log(error);
        if (error.name === 'CastError') {
            return res.status(500).send({
                message: 'Invalid product id.',
                success: false
            });
        }
        res.status(500).send({
            message: 'Error in Delete Category API.',
            success: false,
            error
        })
    }
}

// update category
export const updateCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findById(req.params.id);
        if (!category) {
            return res.status(404).send({
                message: 'Category not found.',
                success: false
            });
        }
        const { updatedCategory } = req.body;
        //find product with this category id
        const products = await productModel.find({ category: category._id });
        //updte product category
        for (let index = 0; index < products.length; index++) {
            const product = products[index];
            product.category = updatedCategory;
            await product.save();
        }
        if (updatedCategory) category.category = updatedCategory;
        //update category
        await category.save();
        res.status(200).send({
            message: 'Category updated successfully.',
            success: true
        })

    } catch (error) {
        console.log(error);
        if (error.name === 'CastError') {
            return res.status(500).send({
                message: 'Invalid product id.',
                success: false
            });
        }
        res.status(500).send({
            message: 'Error in Update Category API.',
            success: false,
            error
        })
    }
}