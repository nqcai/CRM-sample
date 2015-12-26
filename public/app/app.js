angular.module('myApp', ['stuffService']) 

	// inject $http into our controller
	.controller('userController', function($http) {

		var vm = this;

		// make an API call
		$http.get('/api/users')
			.then(function(data) {

				// bind users we receive to vm.users
				vm.users = data.users;

			});

	});