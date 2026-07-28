
const Product=require('../model/Product');
const cloudinary=require('../config/cloudinary');
const fs=require('fs').promises;

//get all products

const getProducts=async(req ,res)=>{
    try{
        const products=await Product.find({});
        res.json(products);
    }catch(error){
        res.status(500).json({message:'server error'});
    }
};

const getProductById=async (req,res)=>{
    try{
        const product=await Product.findById(req.params.id);
        if(product){
            res.json(product);
        }else{
            res.status(404).json({message:'Product not found'});
        }
    }catch(error){
        res.status(500).json({message:'server error'});
    }
};

const createProduct=async(req,res)=>{
    try{
        const {name,description,price,category,stock,imageUrl: bodyImageUrl=''}=req.body;
        let imageUrl = bodyImageUrl;
        if(req.file){
            if (!process.env.CLOUDINARY_URL && (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)) {
                return res.status(500).json({message:'Cloudinary is not configured for file uploads'});
            }
            const result=await cloudinary.uploader.upload(req.file.path, { folder: 'shopnest' });
            // console.log(result);
            imageUrl=result.secure_url;
            await fs.unlink(req.file.path).catch(err => console.error('Failed to remove temp upload file:', err));
        }
        const product=new Product({
            name,
            description,
            price,
            category,
            stock,
            imageUrl
        });
        const savedProduct=await product.save();
        res.status(201).json(savedProduct);
    }catch(error){
        console.error('Create product error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Product validation failed', errors: error.errors });
        }
        res.status(500).json({message: 'Server error'});
    }
};


//update product
const updateProduct=async (req,res)=>{
    try{
        const {name,description,price,category,stock}=req.body;
        const product=await Product.findById(req.params.id);
        if(product){
            product.name=name||product.name;
            product.description=description||product.description;
            product.price=price ||product.price;
            product.category=category||product.category;
            product.stock=stock||product.stock;

            if(req.file){
                if (!process.env.CLOUDINARY_URL && (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)) {
                    return res.status(500).json({message:'Cloudinary is not configured for file uploads'});
                }
                const result=await cloudinary.uploader.upload(req.file.path, { folder: 'shopnest' });
                //  console.log(result);
                product.imageUrl=result.secure_url;
                await fs.unlink(req.file.path).catch(err => console.error('Failed to remove temp upload file:', err));
            }
            const updateProduct=await product.save();
            res.json(updateProduct);
        }else{
            res.status(404).json({message:'Product not found'});
        }
    }
    catch(error){
        res.status(500).json({message:'Server error'});
    }
};


//delete Product;
const deleteProduct=async(req,res)=>{
    try{
        const product=await Product.findById(req.params.id);

        if(product){
            await product.deleteOne();
            res.json({message : 'Product removed'});
        }else{
            res.status(404).json({message:'Product not found'});
        }
    }catch(error){
        res.status(500).json({message: 'Server error'});
    }
};

module.exports={
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}
