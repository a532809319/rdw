var mongodb = require('mongodb')

var config = require('../config')
var app_mongodb_dm
var app_mongodb_alert
var app_mongodb_event
module.exports.init_db = function init_db(callback){
    mongodb.MongoClient.connect(config.devent_url, function(err, db) {
    if(!err) {

      app_mongodb_event = module.exports.eventdb_handler = db
        console.log("app_mongodb_event connected");
      }
        mongodb.MongoClient.connect(config.dalert_url, function(err, db) {
        if(!err) {
          app_mongodb_alert = module.exports.alertdb_handler = db
          console.log("app_mongodb_alert connected");
        }
          mongodb.MongoClient.connect(config.scdm_url, function(err, db) {
          if(!err) {
            app_mongodb_dm = module.exports.dmdb_handler = db
            console.log("app_mongodb_dm connected");
            callback(err)
          }
      });
    });
  });
}
  
    
	module.exports.log_unknowndevice =  function log_unknowndevice(did,remote_ip,callback){
		app_mongodb_dm.collection("gw_execption").update({"did":did},{$set: {"on":Date.now(),"ip":remote_ip}},callback)

	}
	
	module.exports.get_gw_info = function get_gw_info(did,callback){
		app_mongodb_dm.collection("gw").find({"did":did}).toArray(callback)

		
	}
	

 


/**
 * Export it as a module
 *
 * @api public
 */
//module.exports = {eventdb_handler:eventdb_handler,alertdb_handler:alertdb_handler,dmdb_handler:dmdb_handler};
