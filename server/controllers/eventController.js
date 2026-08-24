const Event=require("../models/Event");
const Venue=require("../models/Venue");
const ShowSeat=require("../models/ShowSeat");
async function list(req,res){
 const q={status:"published"};
 if(req.query.type)q.type=req.query.type;
 if(req.query.search)q.title={$regex:req.query.search,$options:"i"};
 res.json(await Event.find(q).populate("venue","name address").populate("organiser","name email").sort({startAt:1}));
}
async function get(req,res){
 const e=await Event.findById(req.params.id).populate("venue").populate("organiser","name email");
 if(!e)return res.status(404).json({message:"Event not found"});
 res.json(e);
}
async function create(req,res){
 const {title,type,description,venue,startAt,endAt,prices}=req.body;
 const v=await Venue.findById(venue);if(!v)return res.status(404).json({message:"Venue not found"});
 const e=await Event.create({title,type,description,venue,startAt,endAt,prices,organiser:req.user.id,status:"draft"});
 res.status(201).json(e);
}
async function update(req,res){res.json(await Event.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}));}
async function publish(req,res){
 const e=await Event.findById(req.params.id).populate("venue");
 if(!e)return res.status(404).json({message:"Event not found"});
 e.status="published"; await e.save();
 const existing=await ShowSeat.countDocuments({event:e._id});
 if(!existing)await ShowSeat.insertMany(e.venue.seats.map(s=>({event:e._id,seatKey:`${s.row}-${s.number}`,row:s.row,number:s.number,category:s.category})));
 res.json(e);
}
async function seats(req,res){
 const seats=await ShowSeat.find({event:req.params.id}).sort({row:1,number:1});
 const now=new Date();
 res.json(seats.map(s=>({...s.toObject(),status:s.status==="held"&&s.holdExpiresAt<=now?"available":s.status})));
}
async function summary(req,res){
 const Booking=require("../models/Booking");
 const data=await Booking.aggregate([{$match:{event:require("mongoose").Types.ObjectId(req.params.id),status:"confirmed"}},
 {$group:{_id:"$event",bookings:{$sum:1},revenue:{$sum:"$amount"},tickets:{$sum:{$size:"$seats"}}}}]);
 res.json(data[0]||{bookings:0,revenue:0,tickets:0});
}
module.exports={list,get,create,update,publish,seats,summary};
