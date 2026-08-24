const r=require("express").Router();const c=require("../controllers/eventController");const {auth,roles}=require("../middleware/auth");
r.get("/",c.list);r.get("/:id",c.get);r.get("/:id/seats",c.seats);r.get("/:id/summary",auth,roles("organiser","admin"),c.summary);
r.post("/",auth,roles("organiser","admin"),c.create);r.put("/:id",auth,roles("organiser","admin"),c.update);r.patch("/:id/publish",auth,roles("organiser","admin"),c.publish);module.exports=r;
