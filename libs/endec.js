var crypto = require('crypto')

function sand_decrypt(b64_encrpt_str,key,iv){
	var decipher = crypto.createDecipheriv('aes-256-cbc',key,iv)
	var buffer = new Buffer(b64_encrpt_str,'base64').toString('binary')
	var dec = Buffer.concat([decipher.update(buffer) , decipher.final()]);
	return dec;
}
function sand_encrypt(raw_data,key,iv){
	var cipher = crypto.createCipheriv('aes-256-cbc',key,iv)
	var enc = Buffer.concat([cipher.update(raw_data) , cipher.final()]);
	return enc

}
/**
 * decoder_package 
 *  input as raw head and aes body
 */

function decoder_package(input_buffer){
	
	var device_package={"headers":"","body":""}
    var raw_pack = JSON.parse(input_buffer.toString())
	device_package.headers = raw_pack.headers
	bodystr = sand_decrypt(raw_pack.body,"SandlacusData#@1SandlacusData#@1","SandlacusData#@1").toString().replace(/\r/g,"").replace(/\n/g,"<br>").replace(/\x01/g," ")
	//console.log(bodystr)
    device_package.body =  JSON.parse(bodystr)
    return device_package
}

function encode_package(header,body){
	header.sts = Date.now().toString()
	var pack = {"headers":header,"body":""}  
    //body = {"msgid":"1002104001E0CAE3400401A8","qdt":"1","qt":"1"}
    pack.body =  sand_encrypt(JSON.stringify(body),"SandlacusData#@1SandlacusData#@1","SandlacusData#@1").toString("base64")  
	return pack
}
/**
 * Export it as a module
 *
 * @api public
 */
module.exports = {sand_decrypt:sand_decrypt,sand_encrypt:sand_encrypt,encode_package:encode_package,decoder_package:decoder_package};