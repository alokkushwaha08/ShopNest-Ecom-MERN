const User=require("../model/user");

//Register a new user
const registerUser=async (req,res)=>{
    const{name,email,password}=req.body;

    try{
        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message : 'User already exists'});
        }
        
        //TODOS: hash the password before saving to the database
        //todos: implement jwt token generation for authentication
        //todos :otp sending for verification for email confirmation implement with codex
        //todos : welcome mail

        const newUser = new User({name,email,password});
        await newUser.save();
        res.status(201).json({message:'User registered successfully'});
    }
    catch(error){
        res.status(500).json({message:'server error'});
    }
};

