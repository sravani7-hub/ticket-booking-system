const crypto=require("crypto");
const Waitlist=require("../models/Waitlist");
const ShowSeat=require("../models/ShowSeat");
const {sendMail}=require("./emailService");

async function offerNext(eventId,category,io){
 const next=await Waitlist.findOne({event:eventId,category,status:"waiting"}).sort({createdAt:1}).populate("customer");
 if(!next)return null;
 const seat=await ShowSeat.findOneAndUpdate(
   {event:eventId,category,status:"available"},
   {$set:{status:"held",holdBy:next.customer._id,holdExpiresAt:new Date(Date.now()+Number(process.env.WAITLIST_OFFER_MINUTES||10)*60000)}},
   {new:true}
 );
 if(!seat)return null;
 next.status="offered";
 next.offeredSeat=seat._id;
 next.offerToken=crypto.randomBytes(24).toString("hex");
 next.offerExpiresAt=seat.holdExpiresAt;
 await next.save();
 const url=`${process.env.CLIENT_URL}/waitlist-offer/${next._id}?token=${next.offerToken}`;
 await sendMail({to:next.customer.email,subject:"Ticket available from waitlist",
   html:`<p>A seat in ${category} is available.</p><p>Complete your booking within the time limit.</p><p><a href="${url}">Complete booking</a></p>`});
 io.to(`show:${eventId}`).emit("seat-updated",{seatId:seat._id,status:"held"});
 return next;
}
module.exports={offerNext};
