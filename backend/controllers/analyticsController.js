const Order = require('../model/Order');
const Product = require('../model/Product');
const User = require('../model/user');

const getAdminStats = async (req, res) => {
    try {
        const usersCount = await User.countDocuments();
        const productsCount = await Product.countDocuments();
        const ordersCount = await Order.countDocuments();

        const totalSalesResult = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$totalAmount' },
                },
            },
        ]);
        const totalSales = totalSalesResult[0]?.totalSales || 0;

        const ordersByStatus = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const statusCounts = ordersByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        const dailySalesData = await Order.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' },
                    },
                    totalSales: { $sum: '$totalAmount' },
                    ordersCount: { $sum: 1 },
                },
            },
            {
                $sort: {
                    '_id.year': 1,
                    '_id.month': 1,
                    '_id.day': 1,
                },
            },
        ]);

        const dailySales = dailySalesData.map((item) => ({
            date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
            totalSales: item.totalSales,
            ordersCount: item.ordersCount,
        }));

        const topProducts = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    quantitySold: { $sum: '$items.qty' },
                    revenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } },
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            { $unwind: '$product' },
            {
                $project: {
                    productId: '$_id',
                    name: '$product.name',
                    quantitySold: 1,
                    revenue: 1,
                },
            },
            { $sort: { quantitySold: -1, revenue: -1 } },
            { $limit: 5 },
        ]);

        return res.json({
            usersCount,
            productsCount,
            ordersCount,
            totalSales,
            statusCounts,
            dailySales,
            topProducts,
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return res.status(500).json({ message: 'Error fetching admin stats', error: error.message });
    }
};

module.exports = {
    getAdminStats,
};