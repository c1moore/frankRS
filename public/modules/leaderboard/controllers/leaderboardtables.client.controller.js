angular.module('leaderboard').controller('LeaderboardTablesCtrl', ['$scope', 'Authentication', '$http', 'ngTableParams', '$filter',
	function($scope, Authentication, $http, ngTableParams, $filter) {
		// route will be leaderboard/recuiterInfo
		$scope.data = {
			users: [],
			error: null
		};

		$http.get('/modules/leaderboard/tests/MOCK_DATA.json').success(function(data) {
			$scope.data.users = data;

			$scope.tableParams = new ngTableParams({
	        	page: 1,            // show first page
	        	count: 10,           // count per page
	        	sorting: {
	        		rank:'asc'		// set the initial sorting to be rank asc
	        	}
	    		}, {
	        	total: $scope.data.users.length, // length of data
	        	getData: function($defer, params) {
	            	var orderedData = params.sorting() ? 
	            		$filter('orderBy')($scope.data.users, params.orderBy()) : 
	            		$scope.data.users;
	            	$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
	        	}
    		});
		}).error(function(error){
			$scope.data.error = error;
		});
	}
]);