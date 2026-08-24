const Booking=require("../models/Booking");
const ShowSeat=require("../models/ShowSeat");
const {confirmBooking,emailBooking}=require("../services/bookingService");
const {offerNext}=require("../services/waitlistService");
async function create(req,res){
 try{
  const b=await confirmBooking({userId:req.user.id,eventId:req.body.eventId,seatIds:req.body.seatIds,waitlistId:req.body.waitlistId});
  await emailBooking(b);
  req.body.seatIds.forEach(id=>req.app.get("io").to(`show:${req.body.eventId}`).emit("seat-updated",{seatId:id,status:"booked"}));
  res.status(201).json(b);
 }catch(e){res.status(409).json({message:e.message});}
}
async function mine(req,res){res.json(await Booking.find({customer:req.user.id}).populate("event","title startAt type").populate("seats","row number category").sort({createdAt:-1}));}
async function cancel(req,res){
 const b=await Booking.findOne({_id:req.params.id,customer:req.user.id,status:"confirmed"}).populate("event");
 if(!b)return res.status(404).json({message:"Booking not found"});
 b.status="cancelled";await b.save();
 const seats=await ShowSeat.find({booking:b._id});
 await ShowSeat.updateMany({booking:b._id},{$set:{status:"available",booking:null,holdBy:null,holdExpiresAt:null}});
 const io=req.app.get("io");
 for(const s of seats){io.to(`show:${b.event._id}`).emit("seat-updated",{seatId:s._id,status:"available"});await offerNext(b.event._id,s.category,io);}
 res.json({message:"Booking cancelled"});
}
module.exports={create,mine,cancel};
