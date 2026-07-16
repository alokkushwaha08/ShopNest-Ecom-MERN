const express=require('express');
const {protect}=require('../middleware/authMiddleware');
const {admin} =require('../middleware/adminMiddleware');
const{getProducts,getProductById,createProduct,updateProduct,deleteProduct}=require('../controllers/productController');

const multer=require('multer');
const upload=multer({dest:'uploads/'});

const router=express.Router();

//all products
router.route('/').get(getProducts).post(protect,admin,upload.single('image'),createProduct);

//specific products
router.route('/:id').get(getProductById).put(protect,admin,updateProduct).delete(protect,deleteProduct);

module.exports=router;

//crud operations
//c-->create (Post)
//R--> read (get)
//u-->update
//d-->delete