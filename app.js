require('./config/config');     //instantiate configuration variables
require('./global_functions');  //instantiate global functions

console.log('Environment:', CONFIG.app);

const express = require('express');
const logger = require('morgan');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
var path = require('path');

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');

const app = express();

app.set('view engine', 'html');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/', express.static(path.join(__dirname, 'public')));

//Passport
app.use(passport.initialize());

//DATABASE
const models = require('./models');

// CORS
app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization, Content-Type');
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});

app.use('/api', apiRouter);
// app.use('/', indexRouter);

// all unmatched requests to this path, with no file extension, redirect to the dash page
app.use('/', function ( req, res, next ) {
	// uri has a forward slash followed any number of any characters except full stops (up until the end of the string)
	if (/\/[^.]*$/.test(req.url)) {
		res.sendfile(__dirname + '/public/index.html');
	} else {
		next();
	}
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	res.status(err.status || 500);
	next(err);
});

module.exports = app;

