const express=require("express");
const cors=require("cors");
const path=require('path');

const dotenv=require("dotenv");
const connectDB=require("./config/db");

dotenv.config();
connectDB();

const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/",(req,res)=>{
    res.send("my backend is working properly");
});

app.use('/api/auth',require('./routes/authRoutes.js'));
app.use('/api/products',require('./routes/productRoutes.js'));
app.use('/api/orders',require('./routes/orderRoutes.js'));
app.use('/api/payment',require('./routes/paymentRoutes.js'));
app.use('/api/analytics',require('./routes/analyticsRoutes.js'));

const PORT=5000;

app.listen(PORT ,()=>{
    console.log(`server is running on ${PORT}`);
});