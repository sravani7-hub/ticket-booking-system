const mongoose=require("mongoose");
const seatSchema=new mongoose.Schema({
  row:{type:String,required:true},number:{type:Number,required:true},
  category:{type:String,enum:["Premium","Standard"],required:true}
},{_id:false});
const schema=new mongoose.Schema({
 name:{type:String,required:true},address:String,
 seats:{type:[seatSchema],required:true}
},{timestamps:true});
module.exports=mongoose.model("Venue",schema);
