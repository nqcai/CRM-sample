angular.module('userService', []) 

	.factory('User', function($http) {

		// create new object
		var userFactory = {};

		// get single user
		userFactory.get = function(id) {
			return $http.get('/api/users/' + id);
		};

		// get all users
		userFactory.get = function() {
			return $http.get('/api/users/');
		};

		// create a user
		userFactory.create = function(userData) {
			return $http.get('/api/users/', userData);
		};

		// update a user
		userFactory.update = function(id, userData) {
			return $http.put('/api/users/' + id, userData);
		};

		// delete a user
		userFactory.delete = function(id) {
			return $http.delete('/api/users/' + id);
		};

		// return entire userFactory object
		return userFactory;

	});