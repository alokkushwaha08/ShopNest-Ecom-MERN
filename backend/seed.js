require('dotenv').config();
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');

const User = require('./model/user');
const Product = require('./model/Product');
const Order = require('./model/Order');

connectDB();

const users = [
	{ name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin', verified: true },
	{ name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'user' },
	{ name: 'Jane Smith', email: 'jane@example.com', password: 'password123', role: 'user' }
];

const products = [
	{ name: 'Vintage Leather Bag', description: 'Stylish vintage leather bag.', price: 79.99, category: 'Bags', stock: '25', imageUrl: '', rating: 4.5, numReviews: 10 },
	{ name: 'Running Sneakers', description: 'Comfortable running shoes.', price: 59.99, category: 'Shoes', stock: '40', imageUrl: '', rating: 4.2, numReviews: 34 },
	{ name: 'Wireless Headphones', description: 'Noise-cancelling over-ear headphones.', price: 129.99, category: 'Electronics', stock: '15', imageUrl: '', rating: 4.7, numReviews: 89 },
	{ name: 'Smart Watch', description: 'Activity tracking smart watch.', price: 99.99, category: 'Electronics', stock: '30', imageUrl: '', rating: 4.1, numReviews: 22 },
	{ name: 'Ceramic Mug', description: 'Handmade ceramic mug.', price: 14.5, category: 'Home', stock: '100', imageUrl: '', rating: 4.8, numReviews: 5 },
	{ name: 'Cotton T-Shirt', description: 'Soft cotton t-shirt.', price: 19.99, category: 'Clothing', stock: '60', imageUrl: '', rating: 4.0, numReviews: 12 }
];

async function seed() {
	try {
		await Order.deleteMany();
		await Product.deleteMany();
		await User.deleteMany();

		const createdUsers = [];
		for (const u of users) {
			const salt = await bcrypt.genSalt(10);
			const hashed = await bcrypt.hash(u.password, salt);
			const userDoc = await User.create({ ...u, password: hashed });
			createdUsers.push(userDoc);
		}

		const createdProducts = await Product.insertMany(products);

		// create a sample order for the second user
		const sampleOrder = await Order.create({
			user: createdUsers[1]._id,
			items: [
				{ productId: createdProducts[0]._id, qty: 2, price: createdProducts[0].price },
				{ productId: createdProducts[2]._id, qty: 1, price: createdProducts[2].price }
			],
			totalAmount: createdProducts[0].price * 2 + createdProducts[2].price * 1,
			address: {
				fullName: 'John Doe',
				street: '123 Main St',
				city: 'Metropolis',
				postalCode: '12345',
				country: 'Countryland'
			},
			paymentId: 'seed_payment_1',
			status: 'pending'
		});

		console.log('Seed completed:');
		console.log('- users:', createdUsers.length);
		console.log('- products:', createdProducts.length);
		console.log('- orders:', sampleOrder ? 1 : 0);
		process.exit(0);
	} catch (error) {
		console.error('Seeding failed:', error);
		process.exit(1);
	}
}

seed();

