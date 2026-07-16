
const express=require("express");
const router=express.Router();

const {protect}=require('../middleware/authMiddleware');
const {admin}=require('../middleware/adminMiddleware');

const {registerUser,loginUser,getUsers}=require("../controllers/authController");

router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/users",protect , admin ,getUsers);

module.exports=router;

