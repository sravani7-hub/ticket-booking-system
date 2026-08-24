const r=require("express").Router();const c=require("../controllers/waitlistController");const {auth}=require("../middleware/auth");
r.post("/",auth,c.join);r.get("/my",auth,c.mine);r.post("/:id/cancel",auth,c.cancel);r.post("/:id/offer-book",auth,c.offerBook);module.exports=r;
