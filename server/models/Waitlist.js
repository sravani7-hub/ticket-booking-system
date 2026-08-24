const mongoose=require("mongoose");
const schema=new mongoose.Schema({
 event:{type:mongoose.Schema.Types.ObjectId,ref:"Event",index:true},
 customer:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
 category:String,
 status:{type:String,enum:["waiting","offered","completed","expired","cancelled"],default:"waiting"},
 offeredSeat:{type:mongoose.Schema.Types.ObjectId,ref:"ShowSeat",default:null},
 offerToken:{type:String,default:null},
 offerExpiresAt:{type:Date,default:null}
},{timestamps:true});
schema.index({event:1,category:1,status:1,createdAt:1});
module.exports=mongoose.model("Waitlist",schema);
