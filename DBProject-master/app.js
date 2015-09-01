var express = require('express');
var passport = require('passport');
var util = require('util');
var FacebookStrategy = require('passport-facebook');
var config = require('./configuration/config');
var mysql = require('mysql');
var path = require('path');
var session = require('express-session');
var favicon = require('serve-favicon');
var logger = require('morgan');
var newSession = require('client-sessions');
var cookieParser = require('cookie-parser');
var stylus = require('stylus');
var bodyParser = require('body-parser');
var contacts = require('./routes/contacts');
var nib = require('nib');
var nodemailer = require('nodemailer');
var moment = require('moment');

var connection = mysql.createConnection({
  host     : config.host,
  user     : config.username,
  password : config.password,
  database : config.database
});

var routes = require('./routes/index');
var users = require('./routes/users');
var signin = require('./routes/signin');
var signup = require('./routes/signup');
var businesslogin = require('./routes/businesslogin');
var useroptions = require('./routes/useroptions');
var businessadmin = require('./routes/businessadmin');
var businessview = require('./routes/businessview');
var myinfo = require('./routes/myinfo');
var invalidatecoupon = require('./routes/invalidate');
var oldfliers = require('./routes/oldfliers');
var prepflier = require('./routes/prepflier');
var userCategory = require('./routes/userCategory');
var app = express();

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

//request.newSession.user_id
var authenticate = function (req, res, next) {
  var isAuthenticated = true;
  console.log(req.newSession.user_id);
  if (req.newSession.user_id == undefined) {
    isAuthenticated = false;
  }
  if (isAuthenticated) {
    next();
  }
  else {
    res.redirect('/');
  }
}

//request.newSession.business_id
var authenticatebusiness = function (req, res, next) {
  var isAuthenticated = true;
  console.log(req.newSession.business_id);
  if (req.newSession.business_id == undefined) {
    isAuthenticated = false;
  }
  if (isAuthenticated) {
    next();
  }
  else {
    res.redirect('/');
  }
}


var logout= require('./routes/logout');
var forgotPassword= require('./routes/forgotPassword');
var availOffer= require('./routes/availoffer');
var inviteFriends= require('./routes/inviteFriends');
var addNewFriends= require('./routes/addNewFriends');


passport.use(new FacebookStrategy({
    //clientID: '957496190961738',
    //clientSecret:'329cba0e2b6eb60c49fec2a31699c96e' ,
    clientID: '826675407413047',
    clientSecret: '97bd866b5ff1c2e1ca7391eb30718bca',
    callbackURL: 'http://urbanbeatsbeta.herokuapp.com/auth/facebook/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      //Check whether the User exists or not using profile.id
      //console.log("Values :" + user.emails[0].value);
      if(config.use_database==='true')
      {
      connection.query("SELECT * from user_info where user_id="+profile.id,function(err,rows,fields){
        if(err) throw err;
        if(rows.length===0)
          {
            console.log("There is no such user, adding now");
            connection.query("INSERT into user_info(user_id,user_name) VALUES('"+profile.id+"','"+profile.username+"')");
          }
          else
            {
              console.log("User already exists in database");
            }
          });
      }
      return done(null, profile);
    });
  }
));


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(express.favicon());
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'keyboard cat', key: 'sid'}));
app.use(cookieParser());
app.use(newSession({
  cookieName: 'newSession',
  secret: 'urbanbeatsdbapplication',
  duration: 24*60*60*1000,
  activeDuration: 1000*60*5
}));
app.use(express.static(path.join(__dirname, 'public')));

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib());
}

// Use Stylus, which compiles .styl --> CSS
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
));
app.use(passport.initialize());
app.use(passport.session());
//app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);
//app.use('/users', users);
app.get('/', routes.do_work);

// for sign-in registered user
app.get('/signin', signin.do_work);
app.post('/signinuser', signin.do_authenticate);
//app.post('/signinFB', signin.do_facebooklogin);

// for registering a new user
app.get('/signup', signup.do_work);
app.post('/signupuser', signup.do_register);

// for sign-in via Facebook
app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/auth/facebook', passport.authenticate('facebook',{scope:'email'}));

//to put initial filters on basis of location and category redirect to userCategory.js
app.post('/usercategory', userCategory.do_work);
// to refine the research on the basis of check_boxes
app.get('/refineRating', authenticate, userCategory.do_work_new);
app.get('/refineAmbience',authenticate,userCategory.do_work_new);
app.get('/refineTakeout',authenticate,userCategory.do_work_new);
app.get('/refineDelivery',authenticate,userCategory.do_work_new);
app.get('/refineAlcohol',authenticate,userCategory.do_work_new);
app.get('/refineParking',authenticate,userCategory.do_work_new);
app.get('/refineOutdoorSeating',authenticate,userCategory.do_work_new);

app.get('/logout',logout.do_work);

app.get('/forgotPassword',forgotPassword.do_work_render);
app.post('/securityQues',forgotPassword.do_work);
app.post('/emailPassword',forgotPassword.sendEmail);
app.post('/availOffer',availOffer.do_work);
app.get('/inviteFriends',addNewFriends.do_work);
app.get('/mailFriends',inviteFriends.do_work);
app.post('/sendSMS',inviteFriends.sendSMS);


app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect : '/test', failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/test');
  });
  
app.get('/test', function(req, res){
	console.log(req.user);
  //res.render('/index', { user: req.user });
  res.redirect('/facebook?user=' + req.user.displayName + '&email=' + req.user.emails[0].value);
});

app.get('/facebook', signin.do_facebooklogin);
  
// for sign-in registered business
app.get('/businesslogin', businesslogin.do_work);
app.post('/businessauthenticate', businesslogin.do_authenticate);

//app.get('/useroptions', businesslogin.do_work);

// contacts redirect
app.get('/contacts', contacts.do_work);

// business Admin page 
app.get('/businessadmin', businessadmin.do_work);
app.post('/businessregister', businessadmin.do_register);

app.get('/businessview',authenticatebusiness, businessview.do_work);

app.get('/myinfo',authenticatebusiness, myinfo.do_work);
app.get('/invalidate',authenticatebusiness, invalidatecoupon.do_work);
app.post('/invalidatecoupon', invalidatecoupon.do_invalidate);

app.get('/oldfliers',authenticatebusiness, oldfliers.do_work);
app.post('/updateflier', oldfliers.do_updateflier);

app.get('/prepflier',authenticatebusiness, prepflier.do_work);
app.post('/addflier', prepflier.do_addflier);

app.post('/notify',userCategory.notifyBusiness);  


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
