import productModel from "../models/productModel.js";
import getDataUri from "../utils/features.js";
import cloudinary from "cloudinary";

// Get all products
export const getAllProductsController = async (req, res) => {
    const { keyword, category } = req.query
    try {
        const products = await productModel.find({
            name: {
                $regex: keyword ? keyword : "",
                $options: "i",
            }
            // category: category ? category : null,
        });
        res.status(200).send({
            message: 'All products fetched successfully.',
            totalProducts: products.length,
            success: true,
            products
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Error in Get All Products API.',
            success: false,
            error
        });
    }
};

//get top products
export const getTopProductsController = async (req, res) => {
    try {
        const products = await productModel.find({}).sort({ rating: -1 }).limit(3);
        res.status(200).send({
            message: 'Top 3 products.',
            success: true,
            products
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Error in Get Top Products API.',
            success: false,
            error
        });
    }
}

//Get single product
export const getSingleProductController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) {
            return res.status(404).send({
                message: 'Product not found.',
                success: false
            });
        }
        res.status(200).send({
            message: 'Single product fetched successfully.',
            success: true,
            product
        });
    } catch (error) {
        console.log(error);
        if (error.name === 'CastError') {
            return res.status(500).send({
                message: 'Invalid product id.',
                success: false
            });
        }
        res.status(500).send({
            message: 'Error in Get Single Product API.',
            success: false,
            error
        });
    }
};

//Create product
export const createProductController = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        if (!name || !description || !price || !stock) {
            return res.status(500).send({
                message: 'Please provide all required fields.',
                success: false
            });
        }

        const file = getDataUri(req.file);
        if (!req.file) {
            return res.status(500).send({
                message: 'Please provide valid images.',
                success: false
            });
        }
        const cdb = await cloudinary.v2.uploader.upload(file.content);
        const image = {
            public_id: cdb.public_id,
            url: cdb.secure_url
        };
        await productModel.create({
            name,
            description,
            price,
            category,
            stock,
            images: [image]
        })
        res.status(201).send({
            message: 'Product created successfully.',
            success: true
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Error in Create Product API.',
            success: false,
            error
        });
    }
};

//update product
export const updateProductController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) {
            return res.status(404).send({
                message: 'Product not found.',
                success: false
            });
        }

        const { name, description, price, category, stock } = req.body;
        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = price;
        if (category) product.category = category;
        if (stock) product.stock = stock;

        await product.save();
        res.status(200).send({
            message: 'Product updated successfully.',
            success: true
        });
    } catch (error) {
        console.log(error);
        if (error.name === 'CastError') {
            return res.status(500).send({
                message: 'Invalid product id.',
                success: false
            });
        }
        res.status(500).send({
            message: 'Error in Update Product API.',
            success: false,
            error
        });
    }
};

//update product image
export const updateProductImageController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) {
            return res.status(404).send({
                message: 'Product not found.',
                success: false
            });
        }
        //chech file
        if (!req.file) {
            return res.status(404).send({
                message: 'Please provide valid images.',
                success: false
            });
        }

        const file = getDataUri(req.file);
        const cdb = await cloudinary.v2.uploader.upload(file.content);
        const image = {
            public_id: cdb.public_id,
            url: cdb.secure_url
        };
        product.images.push(image);
        await product.save();
        res.status(200).send({
            message: 'Product image updated successfully.',
            success: true
        });

    } catch (error) {
        console.log(error);
        if (error.name === 'CastError') {
            return res.status(500).send({
                message: 'Invalid product id.',
                success: false
            });
        }
        res.status(500).send({
            message: 'Error in Update Product Image API.',
            success: false,
            error
        });
    }
}

//delete product image
export const deleteProductImageController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) {
            return res.status(404).send({
                message: 'Product not found.',
                success: false
            });
        }
        //find image id
        const id = req.query.id;
        if (!id) {
            return res.status(404).send({
                message: 'Product image not found.',
                success: false
            });
        }

        let isExist = -1;
        product.images.forEach((item, index) => {
            if (item._id.toString() === id.toString()) isExist = index;
        });
        if (isExist < 0) {
            return res.status(404).send({
                message: 'Image not found.',
                success: false
            });
        }

        // delete the image
        await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);
        product.images.splice(isExist, 1);
        await product.save();
        res.status(200).send({
            message: 'Product image deleted successfully.',
            success: true
        });

    } catch (error) {
        console.log(error);
        if (error.name === 'CastError') {
            return res.status(500).send({
                message: 'Invalid product id.',
                success: false
            });
        }
        res.status(500).send({
            message: 'Error in Delete Product Image API.',
            success: false,
            error
        });
    }
}

//delete product
export const deleteProductController = async (req, res) => {
    try {
        //find product
        const product = await productModel.findById(req.params.id);
        if (!product) {
            return res.status(404).send({
                message: 'Product not found.',
                success: false
            });
        }
        //find and delete image first from cloudinary
        for (let index = 0; index < product.images.length; index++) {
            await cloudinary.v2.uploader.destroy(product.images[index].public_id);
        }
        //delete product
        await product.deleteOne();
        res.status(200).send({
            message: 'Product deleted successfully.',
            success: true
        });

    } catch (error) {
        console.log(error);
        if (error.name === 'CastError') {
            return res.status(500).send({
                message: 'Invalid product id.',
                success: false
            });
        }
        res.status(500).send({
            message: 'Error in Delete Product API.',
            success: false,
            error
        });
    }
}

//create product review and comment
export const productReviewController = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await productModel.findById(req.params.id);
        //check previous review
        const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
        if (alreadyReviewed) {
            return res.status(400).send({
                message: 'You have already reviewed this product.',
                success: false
            });
        }
        //review object
        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id
        };
        //passing the review object to review array
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        //save
        await product.save();
        res.status(200).send({
            message: 'Review added successfully.',
            success: true
        });

    } catch (error) {
        console.log(error);
        if (error.name === 'CastError') {
            return res.status(500).send({
                message: 'Invalid product id.',
                success: false
            });
        }
        res.status(500).send({
            message: 'Error in Product Review API.',
            success: false,
            error
        });
    }
}
