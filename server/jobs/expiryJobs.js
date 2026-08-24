const cron=require("node-cron");
const ShowSeat=require("../models/ShowSeat");
const Waitlist=require("../models/Waitlist");
const {offerNext}=require("../services/waitlistService");
function start(io){
 cron.schedule("* * * * *",async()=>{
  const expired=await ShowSeat.find({status:"held",holdExpiresAt:{$lte:new Date()}});
  for(const s of expired){
   const changed=await ShowSeat.findOneAndUpdate({_id:s._id,status:"held",holdExpiresAt:{$lte:new Date()}},{$set:{status:"available",holdBy:null,holdExpiresAt:null}},{new:true});
   if(changed){io.to(`show:${s.event}`).emit("seat-updated",{seatId:s._id,status:"available"});}
  }
  const offers=await Waitlist.find({status:"offered",offerExpiresAt:{$lte:new Date()}});
  for(const w of offers){
   await Waitlist.updateOne({_id:w._id,status:"offered"},{$set:{status:"expired",offerToken:null}});
   if(w.offeredSeat){
    await ShowSeat.updateOne({_id:w.offeredSeat,status:"held"},{$set:{status:"available",holdBy:null,holdExpiresAt:null}});
    io.to(`show:${w.event}`).emit("seat-updated",{seatId:w.offeredSeat,status:"available"});
    await offerNext(w.event,w.category,io);
   }
  }
 });
}
module.exports=start;
