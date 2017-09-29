var express = require('express');
var router = express.Router();
var backstore =  require('../datastores/backstore')
var keyvalue = require('../datastores/keyvalue')

var app_redis_client = keyvalue.app_redis_client
var async = require('async')
var cachesys = require('../libs/cachesys')

var passport = require('passport')

router.get('/', function(req, res, next) {

  res.redirect("/dash")
})
/* GET home page. */
router.get('/dash', function(req, res, next) {

  
/*
  app_redis_client.keys('dt*',  (err, acceptdts) => {
    app_redis_client.keys('bad-dt*',  (err, baddts)=> {
      app_redis_client.get("mqtt_online_count",(err,mqtt_online_count)=>{
        res.render('dash', { "acceptdts":acceptdts,"baddts":baddts, "mqtt_online_count":mqtt_online_count});
       }) 
    })
  }) */
  async.parallel([
    (callback)=>{
      app_redis_client.keys('dt*',(err,dtlist)=>{
        for(index in dtlist){
         
          dtlist[index] =  dtlist[index].substr(2,8)
          

        }
        out_alertcount = {}
        async.each(dtlist,function(devtype,cb){
          //console.log(devtype)

          backstore.alertdb_handler.collection(devtype).find().count((err,count)=>{
            try{
              tname = cachesys.tid_to_tname(devtype)
              console.log(tname)
              out_alertcount[tname] = count
        
            }catch(e){}
            
            cb(err)
          })

        },function(err,result){
          //console.log(out_alertcount)
          callback(err,{'acceptdts':dtlist,"altercount":out_alertcount})
        })
       
      })
    },
    function(callback){
      app_redis_client.keys('bad-dt*',(err,result)=>{
        callback(err,result)
      })
    },
    function(callback){
      app_redis_client.get('mqtt_online_count',(err,result)=>{
        callback(err,{"mqtt_online_count":result})
      })
    }
  ],
    (err,result)=>{
      out = {}
      for(index in result){
        for(key in result[index]){
            out[key] = result[index][key]
        }
      }
     // console.log(out)
      res.render('dash',out);
    }

  )  
  
});

module.exports = router;
