const jwt=require("jsonwebtoken");
const User =require('../model/user');

const protect=async(req ,res, next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{
            console.log(req.headers.authorization);
            token=req.headers.authorization.split(' ')[1];
            if (token) {
                token = token.trim();
                token = token.replace(/^"|"$/g, '');
            }
            console.log("Token received:", token);
            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET is not configured');
                return res.status(500).json({ message: 'Server configuration error' });
            }
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Token verified, decoded:", decode);
            req.user = await User.findById(decode.id).select('-password');
            next();
        }
        catch(error){
            console.log("Token verification error:", error.message);
            return res.status(401).json({message:'Not authorized,token failed'});
        }
    }
    else{
        return res.status(401).json({message:'Not authorized,no token'});
    }
}
module.exports = { protect };