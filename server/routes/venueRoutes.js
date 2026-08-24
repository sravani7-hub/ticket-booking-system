const r=require("express").Router();const c=require("../controllers/venueController");const {auth,roles}=require("../middleware/auth");
r.get("/",c.list);r.get("/:id",c.get);r.post("/",auth,roles("admin"),c.create);r.put("/:id",auth,roles("admin"),c.update);module.exports=r;
