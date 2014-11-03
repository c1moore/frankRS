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
	        	filter: {
	        		displayName:'l'	//set the initial filter to nothing for name
	        	},
	        	sorting: {
	        		rank:'asc'		// set the initial sorting to be rank asc
	        	}
	    		}, {
	        	total: $scope.data.users.length, // length of data
	        	getData: function($defer, params) {
	            	var filteredData = params.filter() ?
	            		$filter('filter')($scope.data.users, params.filter()) :
	            		$scope.data.users;
	            	var orderedData = params.sorting() ? 
	            		$filter('orderBy')(filteredData, params.orderBy()) : 
	            		$scope.data.users;

	            	params.total(orderedData.length); //set total recalculation for paganation
	            	$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
	        	}
    		});
		}).error(function(error){
			$scope.data.error = error;
		});
	}
]);