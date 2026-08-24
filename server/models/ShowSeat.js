const mongoose=require("mongoose");
const schema=new mongoose.Schema({
 event:{type:mongoose.Schema.Types.ObjectId,ref:"Event",required:true,index:true},
 seatKey:{type:String,required:true},row:String,number:Number,category:String,
 status:{type:String,enum:["available","held","booked"],default:"available",index:true},
 holdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 holdExpiresAt:{type:Date,default:null,index:true},
 booking:{type:mongoose.Schema.Types.ObjectId,ref:"Booking",default:null}
},{timestamps:true});
schema.index({event:1,seatKey:1},{unique:true});
module.exports=mongoose.model("ShowSeat",schema);
