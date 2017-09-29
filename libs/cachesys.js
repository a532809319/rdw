var backstore =  require('../datastores/backstore')
var keyvalue = require('../datastores/keyvalue')
var app_redis_client = keyvalue.app_redis_client

//leave this in memory 
//for instance only
//use local memory to avoid async calls
var devicetype_in_mem={};
//call while 
//1.init
//2.device type update
function load_devicetype_to_cache(){
    backstore.dmdb_handler.collection('dtype').find().toArray((err,typelist)=>{
        for(index in typelist){
            //console.log(typelist[index])
            //console.log(app_redis_client)
            app_redis_client.set("dt"+typelist[index].code,JSON.stringify(typelist[index]))
            devicetype_in_mem[typelist[index].code]=typelist[index]
            
        }
        
      })
}

function tid_to_tname(tid){
    
    return devicetype_in_mem[tid].tname

}

function init_cache_system(err,result,flush){
    load_devicetype_to_cache()
}


module.exports.init_cache_system = init_cache_system
module.exports.tid_to_tname = tid_to_tname