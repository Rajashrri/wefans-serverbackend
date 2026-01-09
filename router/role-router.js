const express = require("express");
const router = express.Router();
const Role = require("../controllers/role-controller");
const {blogSchema } = require("../validators/auth-validator");
const validate = require("../middlewares/validate-middleware");

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyparser = require("body-parser");

router.use(bodyparser.urlencoded({extended:true}));
router.use(express.static(path.resolve(__dirname,'public')))
//crole
router.route("/addrole").post(Role.addrole);
router.route("/getdatarole").get(Role.getdatarole);
router.route("/getroleByid/:id").get(Role.getroleByid);
router.route("/updateRole/:id").patch(Role.updateRole);
router.route("/deleterole/:id").delete(Role.deleterole);
router.route("/update-statusrole").patch(Role.updateStatusRole);
router.use(bodyparser.urlencoded({extended:true}));
router.use(express.static(path.resolve(__dirname,'public')))

    const storage = multer.diskStorage({
        destination: function(req,file, cb){
        if(!fs.existsSync("public")){
            fs.mkdirSync("public");
        }
        if(!fs.existsSync("public/allimages")){
            fs.mkdirSync("public/allimages");
        }
    
        cb(null, "public/allimages");
        },
        filename: function(req,file,cb){
        cb(null, Date.now() + file.originalname);
        },
    });
  
    const upload = multer({
        storage:storage,
    })

    module.exports = router;