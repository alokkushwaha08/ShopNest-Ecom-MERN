const Order = require('../model/Order');
const sendEmail = require('../utils/sendEmail');

const createOrder = async (req, res) => {
    try {
        const { items, totalAmount, address, paymentId, razorpayOrderId } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0 || !totalAmount || !address) {
            return res.status(400).json({ message: 'Invalid order data' });
        }

        const order = new Order({
            user: req.user._id,
            items,
            totalAmount,
            address,
            paymentId,
            razorpayOrderId,
        });

        await order.save();

        const message = `Dear ${req.user.name},\n\nThank you for your order! Your order has been successfully created with the following details:\n\nOrder ID: ${order._id}\nTotal Amount: ${totalAmount}\nShipping Address: ${address.fullName}, ${address.street}, ${address.city}, ${address.postalCode}, ${address.country}\n\nWe will notify once your order is shipped.\nShopNest team`;

        await sendEmail(req.user.email, 'Order Created', message);

        return res.status(201).json({ success: true, message: 'Order created successfully', order });
    } catch (error) {
        console.error('Create order error:', error);
        return res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};

const myOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('items.productId', 'name price');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        await order.save();
        res.json({ message: 'Order status updated', order });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order status', error });
    }
};

module.exports = {
    createOrder,
    myOrders,
    getOrders,
    updateOrderStatus,
};