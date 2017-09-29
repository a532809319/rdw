var express = require('express');
var router = express.Router();

var endec = require('../libs/endec')
/*
function mybodyfun(IncomingMessage,){

    console.log(arguments)
}*/
router.post('/metadata', function(req, res, next) {

    var dec = endec.decoder_package(req.rawBody)
    
    var template = {
        headers: { pv: '3.0.0.1', enc: '2', sig: '0', ev: 'v1',sts:"" },
        body: 
         { msgid: 'A06CD983E2B4C7805481477FF87DF681',rc:"100200",rid:"32",p:"1",
         dt:"01000102",hdv:"1.1.0.0",fwpv:"1.1.0.0",
         fwuv:"1.1.0.1",ifm:"0",t:"1",
         fws:"20480".toString(),fwuri:"http://device.sandlacus.com/fota/img1",fwblks:""}
    }

    var set_para = {
        headers: { pv: '3.0.0.1', enc: '2', sig: '0', ev: 'v1',sts:"" },
        body: 
        {
            "fwuv": "", 
            "dt": "01000002", 
            "msgid": "A06CD983E2B4C7805481477FF87DF681", 
            "t": "2", 
            "rid": "A06CD983E2B4C7805481477FF87DF681", 
            "p": "1", 
            "pui": {
                "sosPhone": "13131313131"
            }, 
            "hdv": "1.0.0.0", 
            "ifm": "0", 
            "mid": "", 
            "fwpv": "1.1.66.0", 
            "rc": "100200"
        }

    }
    template = set_para
    template.body.msgid = dec.body.msgid
    //console.log(template.headers,template.body)
    encoded_pack =JSON.stringify(endec.encode_package(template.headers,template.body))
    
    res.setHeader("content-length", encoded_pack.length);
    res.write(encoded_pack)
 
})
/*
{ headers: { pv: '3.0.0.1', enc: '2', sig: '0', ev: 'v1' },
  body: 
   { msgid: '7E63FB66F3B46101F3B98F78CDF06385',
     did: '1001000102CEE71E0000007A',
     rid: '0',
     rc: '441' } }
*/
router.post('/update-result', function(req, res, next) {
    
    var dec = endec.decoder_package(req.rawBody)
    console.log(dec)

    res.setHeader("content-length", encoded_pack.length);
    res.write(encoded_pack)
 
})

module.exports = router;