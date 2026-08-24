const mongoose=require("mongoose");
const priceSchema=new mongoose.Schema({category:String,price:{type:Number,min:0}},{_id:false});
const schema=new mongoose.Schema({
 title:{type:String,required:true},type:{type:String,enum:["movie","concert"],required:true},
 description:String,organiser:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 venue:{type:mongoose.Schema.Types.ObjectId,ref:"Venue",required:true},
 startAt:{type:Date,required:true},endAt:Date,
 prices:{type:[priceSchema],default:[]},
 status:{type:String,enum:["draft","published","cancelled"],default:"draft"}
},{timestamps:true});
module.exports=mongoose.model("Event",schema);
