const ShowSeat=require("../models/ShowSeat");
async function hold(req,res){
 const {eventId,seatIds}=req.body;if(!eventId||!seatIds?.length)return res.status(400).json({message:"eventId and seatIds required"});
 const expires=new Date(Date.now()+Number(process.env.HOLD_TTL_MINUTES||10)*60000),held=[];
 try{
  for(const id of seatIds){
   const seat=await ShowSeat.findOneAndUpdate({_id:id,event:eventId,$or:[{status:"available"},{status:"held",holdExpiresAt:{$lte:new Date()}}]},
    {$set:{status:"held",holdBy:req.user.id,holdExpiresAt:expires}},{new:true});
   if(!seat)throw new Error("SEAT_UNAVAILABLE"); held.push(seat);
  }
  const io=req.app.get("io");held.forEach(s=>io.to(`show:${eventId}`).emit("seat-updated",{seatId:s._id,status:"held",holdExpiresAt:s.holdExpiresAt}));
  res.json({message:"Seats held",expiresAt:expires,seats:held});
 }catch(e){
  for(const s of held)await ShowSeat.updateOne({_id:s._id,status:"held",holdBy:req.user.id},{$set:{status:"available",holdBy:null,holdExpiresAt:null}});
  res.status(409).json({message:"One or more seats are no longer available"});
 }
}
async function release(req,res){
 const {seatIds}=req.body;
 const r=await ShowSeat.updateMany({_id:{$in:seatIds},status:"held",holdBy:req.user.id},{$set:{status:"available",holdBy:null,holdExpiresAt:null}});
 res.json({released:r.modifiedCount});
}
module.exports={hold,release};
