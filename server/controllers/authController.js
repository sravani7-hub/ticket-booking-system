const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const User=require("../models/User");
function token(u){return jwt.sign({id:u._id,role:u.role,email:u.email},process.env.JWT_SECRET,{expiresIn:"7d"});}
async function register(req,res){
 try{
  const {name,email,password,role="customer"}=req.body;
  if(!name||!email||!password)return res.status(400).json({message:"Name, email and password required"});
  const safeRole=["customer","organiser"].includes(role)?role:"customer";
  if(await User.findOne({email}))return res.status(409).json({message:"Email already registered"});
  const user=await User.create({name,email,password:await bcrypt.hash(password,12),role:safeRole});
  res.status(201).json({token:token(user),user:{id:user._id,name:user.name,email:user.email,role:user.role}});
 }catch(e){res.status(500).json({message:e.message});}
}
async function login(req,res){
 const {email,password}=req.body; const user=await User.findOne({email});
 if(!user||!(await bcrypt.compare(password,user.password)))return res.status(401).json({message:"Invalid credentials"});
 res.json({token:token(user),user:{id:user._id,name:user.name,email:user.email,role:user.role}});
}
async function me(req,res){const u=await User.findById(req.user.id).select("-password");res.json(u);}
module.exports={register,login,me};
