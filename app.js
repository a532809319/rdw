var keyvalue = require('./datastores/keyvalue')
var backstore = require('./datastores/backstore')

var express = require('express');
var app = require('express-ws-routes')();



var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');




var index = require('./routes/index');
var users = require('./routes/users');
var device = require('./routes/device');
var fota = require('./routes/fota');
var imgserice= require('./routes/imgserice');
var  jsonapidevice= require('./routes/jsonapi/device');

var cachesys = require('./libs/cachesys')
var init_cache_sys=cachesys.init_cache_system

backstore.init_db(init_cache_sys)
app.locals.moment = require('moment');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
/*
app.use(function(req, res, next) {
  req.rawBody = '';
  

  req.on('data', function(chunk) { 
    req.rawBody += chunk;

  });

  next();
});*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



var session = require('express-session');
var RedisStore = require('connect-redis')(session);


var session_store_options = {
  ttl:3600,
  db:1
}
//config session on redis
app.use(session({
  store: new RedisStore(session_store_options),
  secret: 'sandlacus@password@session',
  cookie:{
    secure:false
  }
}));

//config passport 
var flash = require('connect-flash');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

app.use(passport.initialize());
app.use(flash());
app.use(passport.session());

// passport config
var Account = require('./models/user');
passport.use(new LocalStrategy(Account.authenticate()));

passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose
mongoose.connect('mongodb://localhost/passport_local_mongoose_express4');




var url_no_auth = ['/users/login','/users/register']
// user login permission required middleware

app.use(function( req, res, next) {
  
  if (req.isAuthenticated()) {
    return next()
  }else{
    //skip all statics
    var reg=new RegExp(/^\/assets/)            
    if(reg.test(req.url)){
      return next()
    }
    //list we don't need auth 
    for(index in url_no_auth){
      if(url_no_auth[index] == req.url){
        //console.log(" no auth acess",req.url)
        return next()
      }
    }
  }
  req.session.redirect_url = req.url
  req.session.save(function(err) {
    res.redirect('/users/login')
  })
  //redirect to login page 

});

//make local vars for jade

app.use(function (req, res, next) {
  res.locals = {
    user: req.user,
    session: req.session,

  };
  next();
});
app.use('/', index);
app.use('/users', users);
app.use('/device', device);
app.use('/fota', fota);
app.use('/imgserice', imgserice);
app.use('/jsonapi', jsonapidevice);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') !=='production' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
