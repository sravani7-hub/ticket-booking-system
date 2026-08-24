const r=require("express").Router();const c=require("../controllers/seatController");const {auth}=require("../middleware/auth");
r.post("/hold",auth,c.hold);r.post("/release",auth,c.release);module.exports=r;
