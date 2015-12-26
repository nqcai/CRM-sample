angular.module('authService', [])

	// ==============================================
	// auth factory to login and get info
	// inject $http for communicating with API
	// inject $q to return promise object
	// inject AuthToken to manage token 
	// ==============================================

	.factory('Auth', function($http, $q, AuthToken) {

		// create auth factory object
		var authFactory = {};

		// handle login
		authFactory.login = function(username, password) {
			// return the promise object and its data
			return $http.post('/api/authenticate', {
				username: username,
				password: password
			})
				.success(function(data) {
					AuthToken.setToken(data.token);
					return data;
				});
		};

		// logout by clearing the token
		authFactory.logout = function() {
			// clear the token
			AuthToken.setToken();
		};

		// check if user is logged in
		// check if there is local token
		authFactory.isLoggedIn = function() {
			if (AuthToken.getToken())
				return true;
			else
				return false;
		};

		// get user info
		authFactory.getUser = function() {
			if (AuthToken.getToken())
				return $http.get('/api/me');
			else
				return $q.reject({ message: 'User has no token.' });
		};

		// return auth factory object
		return authFactory;

	})


	// ==============================================
	// factory for handling tokens
	// inject $window to store token on client side
	// ==============================================

	.factory('AuthToken', function($window) {

		var authTokenFactory = {};

		// get token out of local storage
		authTokenFactory.getToken = function() {
			return $window.localStorage.getItem('token');
		};

		// function to set token or clear token
		// if token is passed, set the token
		// if no token, clear it from local storage
		authTokenFactory.setToken = function(token) {
			if (token)
				$window.localStorage.setItem('token', token);
			else
				$window.localStorage.removeItem('token');
		};

		return authTokenFactory;
	
	})


	// ==============================================
	// application configuration to integrate token into requests
	// ==============================================

	.factory('AuthInterceptor', function($q, AuthToken) {

		var interceptorFactory = {};

		// this will happen on all HTTP requests
		interceptorFactory.request = function() {

			// grab the token
			var token = AuthToken.getToken();

			// if token exists, add it tok header as x-access-token
			if (token)
				config.headers['x-access-token'] = token;

			return config;
		};

		// happens on response errors
		interceptorFactory.responseError = function(response) {

			// if server returns 403 forbidden response
			if (response.status == 403) 
				$location.path('/login');

			// return the errors from the server as a promise
			return $q.reject(response);
		};

		return interceptorFactory;

	});


