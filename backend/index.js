const express=require("express");
const cors=require("cors");

const dotenv=require("dotenv");
const connectDB=require("./config/db");

dotenv.config();
connectDB();

const app=express();
app.get("/",(req,res)=>{
    res.send("my backend is working properly");
});

app.use('api/auth',require('./routes/authRoutes.js'))

const PORT=5000;

app.listen(PORT ,()=>{
    console.log(`server is running on ${PORT}`);
});