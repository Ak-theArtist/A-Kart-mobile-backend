import mongoose from "mongoose";

// Review Model
const reviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required']
    },
    rating: {
        type: Number,
        default: 0
    },
    comment: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: [true, 'user id is required']
    }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required']
    },
    description: {
        type: String,
        required: [true, 'description is required']
    },
    price: {
        type: Number,
        required: [true, 'price is required']
    },
    stock: {
        type: Number,
        required: [true, 'stock is required']
    },
    // quantity: {
    //     type: Number,
    //     required: [true, 'stock is required']
    // },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    images: [{
        public_id: String,
        url: String
    }],
    reviews: [reviewSchema],
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

export const productModel = mongoose.model('Products', productSchema);
export default productModel