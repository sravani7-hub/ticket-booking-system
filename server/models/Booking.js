const mongoose=require("mongoose");
const schema=new mongoose.Schema({
 reference:{type:String,unique:true,index:true},customer:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 event:{type:mongoose.Schema.Types.ObjectId,ref:"Event",required:true},
 seats:[{type:mongoose.Schema.Types.ObjectId,ref:"ShowSeat"}],amount:Number,
 status:{type:String,enum:["confirmed","cancelled"],default:"confirmed"},qrData:String
},{timestamps:true});
module.exports=mongoose.model("Booking",schema);
