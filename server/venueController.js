const Venue=require("../models/Venue");
async function list(req,res){res.json(await Venue.find().sort({name:1}));}
async function get(req,res){const v=await Venue.findById(req.params.id); if(!v)return res.status(404).json({message:"Venue not found"});res.json(v);}
async function create(req,res){
 const {name,address,seats}=req.body;
 if(!name||!Array.isArray(seats)||!seats.length)return res.status(400).json({message:"name and seats required"});
 const seen=new Set();
 for(const s of seats){const key=`${s.row}-${s.number}`;if(seen.has(key))return res.status(400).json({message:"Duplicate seat"});seen.add(key);}
 res.status(201).json(await Venue.create({name,address,seats}));
}
async function update(req,res){res.json(await Venue.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}));}
module.exports={list,get,create,update};
