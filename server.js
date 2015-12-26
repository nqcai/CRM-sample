// CALL THE PACKAGES --------------------
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var morgan = require('morgan'); // used to see requests
var mongoose = require('mongoose'); // for working w/ our database 
var config = require('./config');
var path = require('path');

// connect to database hosted on modulus
mongoose.connect(config.database);

// Use bodyparser to grab info from POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure app to handle CORS requests
app.use(function(req, res, next)  {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \Authorization');
	next();
})

// log all requests to console
app.use(morgan('dev'));



// ROUTES for API
// ===================

// REGISTER our ROUTES
// all routes prefixed with /api
var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);

// Main catchall route
// send users to front end
// has to be after API Routes
app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

// Start the server
app.listen(config.port);
console.log('Magic happens on port ' + config.port);












