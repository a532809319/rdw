var express = require('express');
var router = express.Router();
var backstore =  require('../datastores/backstore')
var ObjectID = require('mongodb').ObjectID;
var sensormgr =require('../libs/sensormgr')
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
var xlsx = require('node-xlsx').default;  
var cachesys = require('../libs/cachesys')
var remotecontrol = require("../libs/remotecontrol")
var endec = require('../libs/endec')

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
/* GET home page. */
router.get('/sensortype', function(req, res, next) {

    backstore.dmdb_handler.collection('dtype').find().toArray((err,result)=>{
    res.render('sensortype', { dtlist: result });
  })
  
});

router.post('/sensortype',upload.any(),(req,res,next)=>{
    //console.log(req)
    //console.log()
    xlsxfile = req.files[0].destination + req.files[0].filename
    console.log(xlsxfile)
    const workSheets = xlsx.parse(xlsxfile);
    for(var key in workSheets){
     var pagedata = workSheets[key].data
     for(var index=0;index<pagedata.length;index++ ){
        if(index!=0){
            line = pagedata[index]

            code = line[0]
            //console.log(code)
            info = {"code":line[0],"tname":line[1],"group":line[2],"function":line[3],
            "model":line[4],"model_name":line[5], "fota_img":line[6],"remote_configable":line[7],
            "heartbeat":line[8],"alert":line[9],"data_query":line[10]}
            if(contains(['',null,undefined],code)){

            }else{
            sensormgr.update_sensor_type(code,info,(err,result)=>{
                
            })}

        }
       //console.log(pagedata[index])
     }
    }
    res.redirect(req.header("Referer"))
 })




//gateway status
router.get('/gateway', function(req, res, next) {

    backstore.dmdb_handler.collection('gw').find().toArray((err,result)=>{
        console.log(result)
    res.render('gatewaylist', { dtlist: result });

    })
});
router.get('/gateways', function(req, res, next) {

        res.render('gatewaylists', { dtlist: "a" });

});



//gateway status
router.post('/gateway',upload.any(),function(req, res, next) {
    console.log("entered",req.file)
    var index = req.body.did;
    var action = req.body.action

    if(action=="remove"){
        sensormgr.removegateway(index,(err,result)=>{
            // res.redirect(req.header("Referer"))
        })
    }else if(action=="import"){
        console.log(req.files)
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
        res.redirect(req.header("Referer"))
    }
    /*
*/
});

//gateway status
router.get('/sensor', function(req, res, next) {
    backstore.dmdb_handler.collection('sl').find().toArray((err,result)=>{
        for(index in result){
            result[index].tid = tid_to_tname(result[index].tid)+"("+result[index].tid+")"
        }
        res.render('sensorlist', { dtlist: result });
    
    })
});
router.get('/sensors', function(req, res, next) {

        res.render('sensorlists', { dtlist: "a" });

});


//gateway status
router.post('/sensor',upload.any(), function(req, res, next) {
    var index = req.body.did;
    var action = req.body.action
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
    
//unknown_dev
router.get('/devtypeunknown', function(req, res, next) {

    backstore.dmdb_handler.collection('devunknown').find().toArray((err,result)=>{
        res.render('devtypeunknown', { dtlist: result });

    })

});

function unknownsensor(req,res){
    backstore.dmdb_handler.collection('unknownsensor').find().toArray((err,result)=>{
        res.render('unknownsensor', { dtlist: result });

    })
}
//unknown_dev
router.get('/unknownsensor', function(req, res, next) {
    
    unknownsensor(req,res)
    
});
router.post('/unknownsensor', function(req, res, next) {

    var index = req.body.id;
    var action = req.body.action
    console.log(req.body)
    if(action=="allow"){
        console.log("on allow sensor")
        backstore.dmdb_handler.collection('unknownsensor').find({_id:ObjectID(index)}).toArray((err,result)=>{
            if(result.length==1){
                try{
                    evt = JSON.parse(result[0].evt)
                }catch(e){
                    res.write("evt not legay")
                }
                
                sensormgr.addsensor(evt.sid,evt.dt,hw_id="",evt.fwv,null)
                backstore.dmdb_handler.collection('unknownsensor').deleteOne({_id:ObjectID(index)},(err,result)=>{
                    unknownsensor(req,res)
                })
    
            }else{
                console.log("not found")
                unknownsensor(req,res)
            }
            
        })
    }else if(action=="remove"){
        backstore.dmdb_handler.collection('unknownsensor').deleteOne({_id:ObjectID(index)},(err,result)=>{
            unknownsensor(req,res)
        })
    }else{
        res.write("404")
    }

})
router.get('/gwunknown', function(req, res, next) {
    backstore.dmdb_handler.collection('gw_execption').find().toArray((err,result)=>{
        res.render('gwunknown', { dtlist: result });

    })
});

router.post('/gwunknown', function(req, res, next) {
    var did =req.body.did
    var action = req.body.action
    if(action=="legay"){
        //TODO: add tid check there
        sensormgr.addgateway(did,did.substr(2,8),'','',(err,result)=>{
            backstore.dmdb_handler.collection('gw_execption').deleteOne({"did":did},(err,result)=>{
                res.redirect(req.header("Referer"))
            })
        })
    }

});

router.get('/gwbundling', function(req, res, next) {
    var did =req.query.did
    backstore.dmdb_handler.collection('gw').find({"did":req.query.did}).toArray((err,gw_info)=>{
  
        if(gw_info.length===1){
            sensormgr.gateway_bundle_list(did,(err,sens_info)=>{
        
                for(index in sens_info){
                    sens_info[index].tid = tid_to_tname(sens_info[index].tid)
                }
                console.log("gw_info",gw_info,"--------","sens_info",sens_info)
                res.render('gwbunding', { "gw_info":gw_info,"sens_info":sens_info});
            })

        }else{
            res.render('gwbunding', { "gw_info":[],"sens_info":[]});
        }
    })

});


router.get('/events', function(req, res, next) {
    
    backstore.dmdb_handler.collection('sl').find({"sid":req.query.sid}).toArray((err,sens_info)=>{
        if(sens_info.length===1){
            backstore.eventdb_handler.collection(sens_info[0].tid).find({"sid":req.query.sid}).sort({rt: -1}).toArray((err,events)=>{
                

                res.render('events', {  type:"Events",sid:req.query.sid,events: events });

            })
        }else{
            //404
            res.write("not found")
        }
    })

});

router.get('/alerts', function(req, res, next) {
    backstore.dmdb_handler.collection('sl').find({"sid":req.query.sid}).toArray((err,sens_info)=>{
        if(sens_info.length===1){
            backstore.alertdb_handler.collection(sens_info[0].tid).find({"sid":req.query.sid}).sort({rt: -1}).toArray((err,events)=>{
                

                res.render('events', { type:"alert",sid:req.query.sid,events: events });

            })
        }else{
            //404
            res.write("not found")
        }
    })
});
router.get('/alert',function (req,res,next) {
    res.render('alarms',{title:"alert",sid:req.query.sid})
})
router.get('/bundlesensor', function(req, res, next) {
    did = req.query.did
    res.render('bundlesenor', { "did":did });
    
})

router.post('/bundlesensor', function(req, res, next) {
    var did = req.body.did
    var sensor_list = req.body.sensor_list
    sensor_list = sensor_list.replace(/\r/g,'').split('\n')
    
    sensormgr.gateway_bundling_sensor(did,sensor_list,(err,result)=>{
        res.redirect("/device/bundlesensor?did="+did)
    })
  
    
})


//gateway status
router.get('/debuggateway', function(req, res, next) {
    //console.log()
     
     res.render('debugtoolbox/debuggateway',{host:req.headers["host"],did:req.query.did});
    

});
router.websocket('/wsdebuggateway', function(info, cb, next) {
    var did = info.req.query.did
    //remotecontrol
    
    cb(function(socket) {
        socket.send('connected!');

        remotecontrol.messagehandle.subscribe(did+'/dynamic', function(topic,message,err) {
           // console.log(Date.now,arguments);
            try{
                socket.send("topic:"+topic+"\r\nmessage:"+message.toString())
                //console.log(endec.decoder_package(message))
                socket.send(JSON.stringify(endec.decoder_package(message),null,2))

            }catch(e)
            {
                console.log(e)
            }
  
        });
        socket.on('message', function (message){
               try{
                var uuid = require("uuid")   
                message =message.replace(/\$DT/g,Date.now().toString())
                message =message.replace(/\$UUID/g,uuid.v1().replace(/-/g,''))
                message =message.replace(/\$DID/g,did)
                obj = JSON.parse(message)
                //console.log(message)
                var eobj = endec.encode_package(obj.headers,obj.body)

                pack = JSON.stringify(eobj)
                //console.log("pack",did,pack)
                remotecontrol.messagehandle.publish(did+"/common",pack, function() {
                    console.log("message published");
                  });
                }catch(e){
                    console.log(e)
                }
            

            //console.log("on message:",message)
        })
    });

});

/* GET home page. */
router.get('/datapack', function(req, res, next) {
    
        backstore.dmdb_handler.collection('datapack').find().toArray((err,result)=>{
        res.render('debugtoolbox/datapack', { dtlist: result });
      })
      
    });
    
//gateway status
router.get('/decodepack', function(req, res, next) {
    //console.log()
     
     res.render('debugtoolbox/decodepack',{host:req.headers["host"],did:req.query.did});
    

});
router.websocket('/wsdecode', function(info, cb, next) {


    
    cb(function(socket) {
        socket.send('connected!');
        socket.on('message', function (message){
            try{
                pack = endec.decoder_package(message)
                console.log(message,pack)
                socket.send(JSON.stringify(pack),null,2)
            }catch(e){
                console.log("wsdecode",e)
            }
        
            

            //console.log("on message:",message)
        })
    });

});
module.exports = router;
