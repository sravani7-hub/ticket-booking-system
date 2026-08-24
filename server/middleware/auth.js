const jwt=require("jsonwebtoken");
function auth(req,res,next){
 const h=req.headers.authorization||"";
 if(!h.startsWith("Bearer ")) return res.status(401).json({message:"Authentication required"});
 try{req.user=jwt.verify(h.slice(7),process.env.JWT_SECRET);next();}
 catch(e){res.status(401).json({message:"Invalid or expired token"});}
}
function roles(...allowed){return (req,res,next)=>allowed.includes(req.user.role)?next():res.status(403).json({message:"Forbidden"});}
module.exports={auth,roles};
