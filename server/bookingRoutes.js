const r=require("express").Router();const c=require("../controllers/bookingController");const {auth}=require("../middleware/auth");
r.post("/",auth,c.create);r.get("/my",auth,c.mine);r.post("/:id/cancel",auth,c.cancel);module.exports=r;
