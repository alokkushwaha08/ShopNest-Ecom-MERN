const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../model/Order');
const sendEmail = require('../utils/sendEmail');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createPaymentOrder = async (req, res) => {
    try {
        const { items, totalAmount, address, currency, receipt, notes } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order items are required.' });
        }

        if (!totalAmount || totalAmount <= 0) {
            return res.status(400).json({ message: 'Total amount is required and must be greater than zero.' });
        }

        if (!address || !address.fullName || !address.street || !address.city || !address.postalCode || !address.country) {
            return res.status(400).json({ message: 'Complete shipping address is required.' });
        }

        const paymentOptions = {
            amount: Math.round(totalAmount * 100),
            currency: currency || 'INR',
            receipt: receipt || `receipt_${Date.now()}`,
            payment_capture: 1,
            notes: notes || {},
        };

        const razorpayOrder = await razorpay.orders.create(paymentOptions);

        if (!razorpayOrder) {
            return res.status(500).json({ message: 'Unable to create Razorpay order.' });
        }

        const order = new Order({
            user: req.user._id,
            items,
            totalAmount,
            address,
            razorpayOrderId: razorpayOrder.id,
            status: 'pending',
        });

        await order.save();

        return res.status(201).json({
            success: true,
            razorpayOrder,
            orderId: order._id,
        });
    } catch (error) {
        console.error('Payment create order error:', error);
        return res.status(500).json({ message: 'Payment order creation failed.', error: error.message });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appOrderId } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment verification parameters.' });
        }

        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
        }

        const orderQuery = appOrderId ? { _id: appOrderId } : { razorpayOrderId: razorpay_order_id };
        const order = await Order.findOne(orderQuery);

        if (!order) {
            return res.status(404).json({ message: 'Order not found for payment verification.' });
        }

        if (order.paymentId) {
            return res.status(200).json({
                success: true,
                message: 'Payment already verified for this order.',
                order,
                payment: {
                    razorpayOrderId: order.razorpayOrderId,
                    paymentId: order.paymentId,
                },
            });
        }

        order.paymentId = razorpay_payment_id;
        order.razorpayOrderId = razorpay_order_id;
        await order.save();

        const message = `Dear ${req.user.name},\n\nYour order has been successfully confirmed with the following details:\n\nOrder ID: ${order._id}\nPayment ID: ${razorpay_payment_id}\nTotal Amount: ${order.totalAmount}\nShipping Address: ${order.address.fullName}, ${order.address.street}, ${order.address.city}, ${order.address.postalCode}, ${order.address.country}\n\nWe will notify you once your order is shipped.\nShopNest team`;
        await sendEmail(req.user.email, 'Order Payment Confirmed', message);

        return res.status(200).json({
            success: true,
            message: 'Payment verified and order updated successfully.',
            order,
            payment: {
                razorpayOrderId: order.razorpayOrderId,
                paymentId: order.paymentId,
                signature: razorpay_signature,
            },
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        return res.status(500).json({ message: 'Payment verification failed.', error: error.message });
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment,
};
