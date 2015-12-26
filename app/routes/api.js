var bodyParser = require('body-parser'); // get body-parser
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var config = require('../../config');

// super secret for creating tokens
var superSecret = config.secret;

module.exports = function(app, express) {

	// get an instance of the express router
	var apiRouter = express.Router();

	// route for authenticating users
	apiRouter.post('/authenticate', function(req, res) {

		// find the user
		// select the pswd explicitly since mongoose is not returning it by default
		User.findOne({
			username: req.body.username
		}).select('password').exec(function(err, user) {

			if (err) throw err;

			// no user with that username was found
			if (!user) {
				res.json({ sucess: false, message: 'Authentication failed. User not found\.' });
			} else if (user) {

				// check if pswd matches
				var validPassword = user.comparePassword(req.body.password);
				if(!validPassword) {
					res.json({ sucess: false, message: 'Authentication failed. Wrong password.'});
				} else {

					// if user is found and password is correct, create TOKEN
					var token = jwt.sign(user, superSecret, {
						expiresIn: 86400 // expires in 24 hours
					});

					// return the infformation including token as a JSON
					res.json({
						sucess: true,
						message: "Enjoy your token!",
						token: token
					});
				}
			}
		});
	});

	// middleware to use for all requests
	apiRouter.use(function(req, res, next) {

		// do logging
		console.log('Somebody just came to our app!');

		// Will authenticate users here

		// check header or url params or post params for token
		var token = req.body.token || req.param('token') || req.headers['x-access-token'];

		// decode token
		if (token) {

			// verifies secret and checks expiration
			jwt.verify(token, superSecret, function(err, decoded) {
				if (err) {
					return res.status(403).send({ success: false, message: 'Failed to authenticate token.' });
				} else {
					// if everything is good, save request for use in other routes
					req.decoded = decoded;
					next();
				}
			});
		} else {
			// no token
			// return an HTTP response of 403 (access forbidden) and an error message
			return res.status(403).send({ success: false, message: 'No token provided.' });
		}
	});

	// test route to make sure everything's working
	// accessed at GET localhost:8080/api
	apiRouter.get('/', function(req, res) {
		res.json({ message: 'hooray! welcome to our api!' });
	});

// on routes that end in /users
apiRouter.route('/users')

		// create a user (accessed at POST localhost:8080/api/users)
		.post(function(req, res) {

			// create new instance of User model
			var user = new User();

			// set users info (from the request)
			user.name = req.body.name;
			user.username = req.body.username;
			user.password = req.body.password;

			// save user and check for errors
			user.save(function(err) {
				if (err) res.send(err);
				res.json({ message: 'User created!' });

			});

		})

		// get all the users (accessed at GET localhost:8080/api/users)
		.get(function(req, res) {
				User.find(function(err, users) {
					if (err) res.send(err);

					// return the users
					res.json(users);
				});
		});
		
// api endpoint to get user info
apiRouter.get('/me', function(req, res) {
	res.send(req.decoded);
});

// on routes that end in /users/:user_id
apiRouter.route('/users/:user_id')

		// get the user with that user_id (accessed at GET localhost:8080/api/users/:user_id)
		.get(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {
				if (err) res.send(err);

				// return that user based on id
				res.json(user);
			});
		})

		// update the user with that user_id (accessed at PUT localhost:8080/api/users/:user_id)
		.put(function(req, res) {

			// use our user model to find the user we want (same as .get)
			User.findById(req.params.user_id, function(err, user) {
				if (err) res.send(err);

				// update the users info only if it's new
				if (req.body.name) user.name 						= req.body.name;
				if (req.body.username) user.username 		= req.body.username;
				if (req.body.password) user.password 		= req.body.password;

				// save the user
				user.save(function(err) {
					if (err) res.send(err); 

					// return a message
					res.json({ message: 'User updated!' });
				});
			});
		})

		// delete the user with that user_id (accessed at DELETE localhost:8080/api/users/:user_id)
		.delete(function(req, res) {
			User.remove({
				_id: req.params.user_id
			}, function(err, user) {
				if (err) res.send(err);

				res.json({ message: 'Successfully deleted :(' });
			});
		});

		return apiRouter;
};































