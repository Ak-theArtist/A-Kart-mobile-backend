import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";

//create orders
export const createOrderController = async (req, res) => {
    try {
        const {
            shippingInfo,
            orderItems,
            paymentMethod,
            paymentInfo,
            itemPrice,
            tax,
            shippingCharges,
            totalAmount,
        } = req.body;

        // Check if orderItems is an array and has valid quantity values
        if (!Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).send({
                message: "Order items cannot be empty.",
                success: false
            });
        }

        for (let item of orderItems) {
            if (!item.quantity || item.quantity <= 0) {
                return res.status(400).send({
                    message: "Each order item must have a valid quantity.",
                    success: false
                });
            }
        }

        // Create order
        await orderModel.create({
            user: req.user._id,
            shippingInfo,
            orderItems,
            paymentMethod,
            paymentInfo,
            itemPrice,
            tax,
            shippingCharges,
            totalAmount
        });

        // Update stock
        for (let i = 0; i < orderItems.length; i++) {
            const product = await productModel.findById(orderItems[i].product);
            if (!product) {
                return res.status(404).send({ message: "Product not found", success: false });
            }
            if (orderItems[i].quantity > product.stock) {
                return res.status(400).send({ message: `Not enough stock for ${product.name}`, success: false });
            }
            product.stock -= orderItems[i].quantity;
            await product.save();
        }

        res.status(201).send({
            message: "Order Placed Successfully.",
            success: true
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error in Create Order API.",
            success: false,
            error
        });
    }
};

//get all orders - my orders
export const getMyOrdersController = async (req, res) => {
    try {
        //find all orders
        const orders = await orderModel.find({ user: req.user._id }).populate("user", "name email");
        if (!orders) {
            return res.status(404).send({
                message: "No orders found.",
                success: false
            });
        }
        res.status(200).send({
            message: "Your Orders.",
            success: true,
            totalOrdes: orders.length,
            orders
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error in Get My Orders API.",
            success: false,
            error
        });
    }
}

//get single order - order details
export const getSingleOrderController = async (req, res) => {
    try {
        //find order details
        const order = await orderModel.findById(req.params.id);
        if (!order) {
            return res.status(404).send({
                message: "Order not found.",
                success: false
            });
        }
        res.status(200).send({
            message: "Order Details fetched successfully.",
            success: true,
            order
        });

    } catch (error) {
        console.log(error);
        if (error.name === 'CastError') {
            return res.status(500).send({
                message: 'Invalid id.',
                success: false
            });
        }
        res.status(500).send({
            message: "Error in Get Single Order API.",
            success: false,
            error
        });
    }
}

// ===================admin controllers

//get all orders - admin
export const getAllOrdersController = async (req, res) => {
    try {
        //find all orders
        const orders = await orderModel.find({});
        res.status(200).send({
            message: "All Orders data.",
            success: true,
            totalOrders: orders.length,
            orders
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error in Get All Orders Admin API.",
            success: false,
            error
        });
    }
}

//update order status - admin
export const changeOrderStatusController = async (req, res) => {
    try {
        //find order
        const order = await orderModel.findById(req.params.id);
        if (!order) {
            return res.status(404).send({
                message: "Order not found.",
                success: false
            });
        }
        if (order.orderStatus === 'Processing') order.orderStatus = "Shipped";
        else if (order.orderStatus === 'Shipped') {
            order.orderStatus = "Delivered";
            order.deliveredAt = Date.now();
        }
        else return res.status(500).send({
            message: "order already delivered.",
            success: false
        });
        //update order
        // order.orderStatus = req.body.status;
        await order.save();
        res.status(200).send({
            message: "Order status updated successfully.",
            success: true,
        });

    } catch (error) {
        console.log(error);
        if (error.name === 'CastError') {
            return res.status(500).send({
                message: 'Invalid id.',
                success: false
            });
        }
        res.status(500).send({
            message: "Error in Update Order Status Admin API.",
            success: false,
            error
        });
    }
}
