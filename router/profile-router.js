const express = require("express");
const router = express.Router();
const profilecontrollers = require("../controllers/profile-controller");

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyparser = require("body-parser");

router.use(bodyparser.urlencoded({extended:true}));
router.use(express.static(path.resolve(__dirname,'public')))

const storage = multer.diskStorage({
    destination: function(req,file, cb){
      if(!fs.existsSync("public")){
          fs.mkdirSync("public");
      }
      if(!fs.existsSync("public/profile")){
          fs.mkdirSync("public/profile");
      }
      cb(null, "public/profile");
    },
    filename: function(req,file,cb){
      cb(null, Date.now() + file.originalname);
    },
  });
  
  const upload = multer({
      storage:storage,
  })

router.route("/editbyid/:id").get(profilecontrollers.getdatabyid);
router.patch("/editprofile/:id",upload.single('profile_pic'), profilecontrollers.updateprofile);
router.route("/updatepassword/:id").patch(profilecontrollers.updatepassword);

module.exports = router;