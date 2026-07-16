const express=require("express");
const cors=require("cors");

const dotenv=require("dotenv");
const connectDB=require("./config/db");

dotenv.config();
connectDB();

const app=express();
app.use(express.json);
app.use(express.urlencoded({extended:true}));

app.get("/",(req,res)=>{
    res.send("my backend is working properly");
});

app.use('api/auth',require('./routes/authRoutes.js'));
app.use('/api/products',require('./routes/productRoutes.js/index.js'));
app.use('/api/orders',require('./routes/orderRoutes'));
app.use('/api/payment',require('./routes/paymentRoutes'));
app.use('/api/analytics',require('./routes/analyticsRoutes'));

const PORT=5000;

app.listen(PORT ,()=>{
    console.log(`server is running on ${PORT}`);
});