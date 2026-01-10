const express = require("express");
const router = express.Router();
const Template = require("../controllers/template-controller");
const {blogSchema } = require("../validators/auth-validator");
const validate = require("../middlewares/validate-middleware");

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyparser = require("body-parser");

router.use(bodyparser.urlencoded({extended:true}));
router.use(express.static(path.resolve(__dirname,'public')))
//crole


router.use(bodyparser.urlencoded({extended:true}));
router.use(express.static(path.resolve(__dirname,'public')))

    const storage = multer.diskStorage({
        destination: function(req,file, cb){
        if(!fs.existsSync("public")){
            fs.mkdirSync("public");
        }
        if(!fs.existsSync("public/template")){
            fs.mkdirSync("public/template");
        }
    
        cb(null, "public/template");
        },
        filename: function(req,file,cb){
        cb(null, Date.now() + file.originalname);
        },
    });
  
    const upload = multer({
        storage:storage,
    })

router.get("/getSectionTemplateById/:id", Template.getSectionTemplateById);

router.post("/save", upload.any(), Template.saveDynamicTemplateData);
router.get("/data/:celebId/:id", Template.getSectionDataBySectionId);


    module.exports = router;