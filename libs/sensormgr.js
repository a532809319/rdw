var backstore =  require('../datastores/backstore')


function update_sensor_type(code,info,callback){

    backstore.dmdb_handler.collection('dtype').update({"code":code},{$set:info},{upsert:true,w:1},callback)
}
function addsensor(sid,tid,hw_id,sw_ver,callback){


    backstore.dmdb_handler.collection('sl').update({"sid":sid},{$set:{"sid":sid,"tid":tid,"hw_id":hw_id,"sw_ver":sw_ver}},{upsert:true},callback)


}



function addgateway(did,tid,hw_id,sw_ver,callback){
    //
    backstore.dmdb_handler.collection('gw').update({"did":did},{$set:{"did":did,"actived":false,"ban":false}},{upsert:true},(err,result)=>{
        //also add a fake sensor itself
        backstore.dmdb_handler.collection('sl').update({"sid":did},{$set:{"sid":did,"tid":tid,"hw_id":hw_id,"sw_ver":sw_ver,"gateway":did}},{upsert:true},callback)
        
    })
       
}


function clear_bundleing_gateway(did,callback){
    backstore.dmdb_handler.collection('sl').update({"gateway":did},{$set:{"gateway":""}},callback)
}


function removegateway(did,callback){
        /*1.clear bundling
         */
        clear_bundleing_gateway(did,(err,result)=>{
            //remove gateway
            backstore.dmdb_handler.collection('gw').deleteOne({"did":did},(err,result)=>{
                //remove fake sensor in list also
                backstore.dmdb_handler.collection('sl').deleteOne({"sid":did},callback)
            })
        })

}
//return a sensor list

function gateway_bundle_list(did,callback){
    backstore.dmdb_handler.collection('sl').find({"gateway":did}).toArray(callback)
}

function gateway_bundling_sensor(did,sid_list,callback){

    backstore.dmdb_handler.collection('sl').update({"gateway":{$in:["",null]},"sid":{$in:sid_list}},{$set:{"gateway":did}},{multi:true},callback)
}
module.exports.addsensor = addsensor

module.exports.addgateway = addgateway
module.exports.clear_bundleing_gateway = clear_bundleing_gateway
module.exports.removegateway = removegateway
module.exports.gateway_bundle_list = gateway_bundle_list
module.exports.gateway_bundling_sensor = gateway_bundling_sensor
module.exports.update_sensor_type=update_sensor_type