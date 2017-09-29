var ascoltatori = require('ascoltatori');
var uuid = require("uuid")
var endec = require("./endec")
var mqcfg = {
type: 'amqp',
json: false,
amqp: require('amqp'),
exchange: 'ascolatore5672'
}

var messagehandle ;
ascoltatori.build(mqcfg,function (err, ascoltatore) {
    messagehandle = ascoltatore
    module.exports.messagehandle = ascoltatore
    console.log("MQTT-MQ Connected")


});


function notify_gateway_parameter_query(did){
   var template = {
        "headers": {
            "ev": "v1",
            "sts": "$DT",
            "func": "3",
            "pv": "3.0.0.1",
            "sig": "0",
            "enc": "2"
        },
        "body": {
            "msgid": "$UUID",
            "dtl": "$DID",
            "qt": "2",
            "qdt": "1",
            "qc": ""
        }
    }
    template.body.msgid = uuid.v1().replace(/-/g,'')
    template.body.dtl = did
    eobj = endec.encode_package(template.headers,template.body)
    pack = JSON.stringify(eobj)
    messagehandle.publish(did+"/common",pack)

}