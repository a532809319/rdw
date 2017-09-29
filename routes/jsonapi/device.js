var express = require('express');
var router = express.Router();
var backstore =  require('../../datastores/backstore')
var ObjectID = require('mongodb').ObjectID;
var sensormgr =require('../../libs/sensormgr')
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
var xlsx = require('node-xlsx').default;
var cachesys = require('../../libs/cachesys')
var remotecontrol = require("../../libs/remotecontrol")
var endec = require('../../libs/endec')

var tid_to_tname = cachesys.tid_to_tname
function contains(arr, obj) {
    var i = arr.length;
    while (i--) {
        if (arr[i] === obj) {
            return true;
        }
    }
    return false;
}
router.get('/gateways', function(req, res, next) {
    console.log('req.para', req.query)
    var sort = req.query.sort
    var order = req.query.order

    if(sort == undefined){
        sort = 'did'
    }
    switch (order){
        case "desc":
            order = -1
            break;
        case "asc":

        default:
            order = 1
    }
    if(order==undefined){
        order=1
    }
    var search = req.query.search;
    console.log('req.seatch--------------------------', req.query.search)


    // console.log(2)
    if(search){
        console.log(search)
        fileSearch={did:{$regex : ".*"+search+".*"}}
    }else {
        fileSearch={}
    }
        var query_handler = backstore.dmdb_handler.collection('gw').find(fileSearch, {sort: [[sort, order]]})

        query_handler.count((err, count) => {

            query_handler.skip(parseInt(req.query["offset"]))
                .limit(parseInt(req.query["limit"]))
                .toArray((err, result) => {
                    console.log(result, "resulet")
                    //res.render('gatewaylist', { dtlist: result });
                    output = {total: count, rows: []}
                    output["rows"] = result

                    res.send(JSON.stringify(output))

                })
        })






});
router.get('/gateway',function (req,res,next) {
    res.render('gatewaylists')
})
//gateway status
router.get('/addsensor',function (req,res,next) {
    res.render('addsensor')
})
router.post('/addsensor',function (req,res,next) {
    // sid":sid,"tid":tid,"hw_id":hw_id,"sw_ver":sw_ver

    console.log(req.body)
    sid=req.body.sid
    tid=req.body.tid
    hw_id=req.body.hw_id
    sw_ver=req.body.sw_ver;
    sensormgr.addsenso(sid,tid,hw_id,sw_ver,(err,result)=>{

    })
})
router.post('/gateways',upload.any(),function(req, res, next) {
    var index = req.body.did;
    var action = req.body.action

    if(action=="remove"){
        sensormgr.removegateway(index,(err,result)=>{
             res.redirect(req.header("Referer"))
        })
    }else if(action=="import"){
        xlsxfile = req.files[0].destination + req.files[0].filename
        console.log(xlsxfile)
        const workSheets = xlsx.parse(xlsxfile);
        for(var key in workSheets){
            var pagedata = workSheets[key].data
            for(var index=0;index<pagedata.length;index++ ){
                if(index!=0){
                    line = pagedata[index]

                    //did tid hw_id sw_ver
                    did = line[0]
                    tid = line[1]
                    hw_id = line[2]
                    sw_ver = line[3]
                    if(contains(['',null,undefined],did)){

                    }else{
                        sensormgr.addgateway(did,tid,hw_id,sw_ver,(err,result)=>{

                        })
                    }

                }
                //console.log(pagedata[index])
            }
        }
       res.redirect('../device/gateways')
    }

});
// gwbunding
router.get('/gwbundling', function(req, res, next) {
    console.log('enter')
         res.render('gwbundings',{did:req.query.did})
})
router.get('/gwbundlings', function(req, res, next) {
    console.log('enter datar')
    var did =req.query.did;
    console.log(did)
    var gateway=req.query.gateway;
    console.log( typeof gateway,"------")
   console.log(gateway==="1")
    backstore.dmdb_handler.collection('gw').find({"did":req.query.did}).toArray((err,gw_info)=>{
            console.log(did,"adfadfadf")
        if(gw_info.length===1){
            console.log(123)
            sensormgr.gateway_bundle_list(did,(err,sens_info)=>{

                for(index in sens_info){
                    sens_info[index].tid = tid_to_tname(sens_info[index].tid)
                }
                console.log("gw_info",gw_info,"--------","sens_info",sens_info)
                // res.send('gwbunding', { "gw_info":gw_info,"sens_info":sens_info});
                // var output={
                //     "gw_info":gw_info,
                //     "sens_info":sens_info
                // }
                // console.log(output,"outpuub")
                // res.send(JSON.stringify(output))
                if(gateway==="1"){
                    console.log(1)
                    res.send(JSON.stringify(gw_info))
                }else {
                    res.send(JSON.stringify(sens_info))
                }
            })

        }else{
            console.log('null')
            res.render('gwbunding', { "gw_info":[],"sens_info":[]});
        }
    })

});


//senser
router.get('/sensor', function(req, res, next) {

//     for(index in result){
//         result[index].tid = tid_to_tname(result[index].tid)+"("+result[index].tid+")"
//     }
//     res.render('sensorlist', { dtlist: result });
//
// })
    var sort = req.query.sort
    var order = req.query.order
    var search=req.query.search

    if(sort == undefined){
        sort = 'gateway'
    }
    switch (order){
        case "desc":
            order = -1
            break;
        case "asc":

        default:
            order = 1
    }
    if(order==undefined){
        order=1
    }
    if(search){
        schfilter ={sid:{$regex : ".*"+search+".*"}}
    }else{
        schfilter={}
    }
    var   query_handler=backstore.dmdb_handler.collection('sl').find(schfilter,{sort:[[sort,order]]})
    query_handler.count((err,count)=>{
        query_handler.skip(parseInt(req.query["offset"]))
            .limit(parseInt(req.query["limit"]))
            .toArray((err,result)=>{
               console.log(result,"result")
                for(index in result){
                    result[index].tid = tid_to_tname(result[index].tid)+"("+result[index].tid+")"
                }



                output = {total: count, rows: []}
                output["rows"] = result
                res.send(JSON.stringify(output))
            })
    })


});
router.get('/sensors', function(req, res, next) {

    res.render('sensorlists', { dtlist: "a" });

});
router.post('/sensor',upload.any(), function(req, res, next) {
    var index = req.body.did;
    var action = req.body.action;
    xlsxfile = req.files[0].destination + req.files[0].filename
    console.log(xlsxfile)
    const workSheets = xlsx.parse(xlsxfile);
    for(var key in workSheets){
        var pagedata = workSheets[key].data
        for(var index=0;index<pagedata.length;index++ ){
            if(index!=0){
                line = pagedata[index]
                //did tid hw_id sw_ver
                sid = line[0]
                tid = line[1]
                hw_id = line[2]
                sw_ver = line[3]
                if(contains(['',null,undefined],sid)){

                }else{
                    sensormgr.addsensor(sid,tid,hw_id,sw_ver,(err,result)=>{

                    })
                }

            }
            //console.log(pagedata[index])
        }
    }
    res.redirect(req.header("Referer"))
});
router.get('/alert',function (req,res,next) {
    res.render('alarms',{title:"alerts",sid:req.query.sid})
})
router.get('/alerts', function(req, res, next) {
     backstore.dmdb_handler.collection('sl').find({"sid":req.query.sid}).toArray((err,sens_info)=> {
             if(sens_info.length===1) {
                 console.log(sens_info,"infofof--------")
                 var query_handler = backstore.alertdb_handler.collection(sens_info[0].tid).find({"sid": req.query.sid}).sort({rt: -1});
                 query_handler.count((err, count) => {
                     query_handler.skip(parseInt(req.query["offset"]))
                         .limit(parseInt(req.query["limit"]))
                         .toArray((err, result) => {

                             output = {total: count, rows: []}
                             output["rows"] = result
                             res.send(JSON.stringify(output))
                         })
                 })
             }
     })



})
router.get('/event',function (req,res,next) {
    res.render('alarms',{title:"events",sid:req.query.sid})
})
router.get('/events', function(req, res, next) {
    var search=req.query.search;
    if(search){
        console.log(search)
       fillSearch={"sid":req.query.sid,"gateway":{$regex:".*"+search+".*"}}

    }else {
        console.log(1)
        fillSearch={"sid":req.query.sid}
    }
    backstore.dmdb_handler.collection('sl').find(fillSearch).toArray((err,sens_info)=> {
        if(sens_info.length===1) {
            console.log(sens_info,"infofof--------")
            var query_handler = backstore.eventdb_handler.collection(sens_info[0].tid).find({"sid": req.query.sid}).sort({rt: -1});
            query_handler.count((err, count) => {
                query_handler.skip(parseInt(req.query["offset"]))
                    .limit(parseInt(req.query["limit"]))
                    .toArray((err, result) => {

                        output = {total: count, rows: []}
                        output["rows"] = result
                        res.send(JSON.stringify(output))
                    })
            })
        }
    })

});

router.get('/bundlesensor', function(req, res, next) {
    did = req.query.did
    res.render('bundlesensors', { "did":did });

})

router.post('/bundlesensor', function(req, res, next) {
    var did = req.body.did

    var sensor_list = req.body.sensor_list
    sensor_list = sensor_list.replace(/\r/g,'').split('\n')

    sensormgr.gateway_bundling_sensor(did,sensor_list,(err,result)=>{
        res.redirect("../jsonapi/bundlesensor?did="+did)
    })


})


module.exports = router;