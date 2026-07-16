
const Product=require('../model/Product');
const cloudinary=require('../config/cloudinary');

//get all products

const getProducts=async(req ,res)=>{
    try{
        const products=await Product.find({});
        res.json(products);
    }catch(error){
        res.status(500).json({message:'server error'});
    }
};

const getProductById=aync (req,res)=>{
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
        const {name,description,price,category,stock}=req.body;
        let imageUrl='';
        if(req.file){
            const result=await cloudinary.uploader.upload(req.file.path);
            console.log(result);
            imageUrl=result.secure_url;
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
        res.status(500).json({message: 'server error'});
    }
};


//update product

