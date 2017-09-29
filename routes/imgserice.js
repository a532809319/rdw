
var express = require('express');
var router = express.Router();
var multer  = require('multer')
var upload = multer({ dest: 'flash/images/' })


router.get('/upload',(req,res,next)=>{
    //console.log(req)
    //console.log()
    res.render('imgsvr/upload',{});
 })

router.post('/upload',upload.any(),(req,res,next)=>{
    //console.log(req)
    //console.log()
    xlsxfile = req.files[0].destination + req.files[0].filename
   
    res.redirect(req.header("Referer"))
 })


 module.exports = router;