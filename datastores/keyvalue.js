var redis = require("redis")
var app_redis_client = redis.createClient(); 


app_redis_client.on('ready',function() {
    console.log("Redis is ready");
});
/**
 * Export it as a module
 *
 * @api public
 */
module.exports.app_redis_client = app_redis_client;