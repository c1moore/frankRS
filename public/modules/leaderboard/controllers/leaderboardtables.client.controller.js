angular.module('leaderboard').controller('LeaderboardTablesCtrl', ['$scope', 'Authentication', '$http', 'ngTableParams', '$filter',
	function($scope, Authentication, $http, ngTableParams, $filter) {
		// route will be leaderboard/recuiterInfo
		$scope.data = {
			users: [],
			error: null
		};

		var mainApi = '/leaderboard/maintable';
		var testApi = '/modules/leaderboard/tests/MOCK_DATA.json';

		$http.get(testApi).success(function(data) {

			$scope.mainTableParams = new ngTableParams({
	        	page: 1,            // show first page
	        	count: 10,           // count per page
	        	filter: {
	        		displayName:''	//set the initial filter to nothing for name
	        	},
	        	sorting: {
	        		rank:'asc'		// set the initial sorting to be rank asc
	        	}
	    		}, {
	        	total: $scope.data.users.length, // length of data
	        	getData: function($defer, params) {
	            	var filteredData = params.filter() ?
	            		$filter('filter')(data, params.filter()) :
	            		data;
	            	var orderedData = params.sorting() ? 
	            		$filter('orderBy')(filteredData, params.orderBy()) : 
	            		data;

	            	params.total(orderedData.length); //set total recalculation for paganation
	            	$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
	        	}
    		});
		}).error(function(error){
			$scope.data.error = error;
		});

		$http.get('/modules/leaderboard/tests/MOCK_ATTENDEE_DATA.json').success(function(data) {

			$scope.attendingTableParams = new ngTableParams({
	        	page: 1,            // show first page
	        	count: 10,           // count per page
	        	filter: {
	        		displayName:''	//set the initial filter to nothing for name
	        	},
	        	sorting: {
	        		displayName:'asc'		// set the initial sorting to be displayName asc
	        	}
	    		}, {
	        	total: $scope.data.users.length, // length of data
	        	getData: function($defer, params) {
	            	var filteredData = params.filter() ?
	            		$filter('filter')(data, params.filter()) :
	            		data;
	            	var orderedData = params.sorting() ? 
	            		$filter('orderBy')(filteredData, params.orderBy()) : 
	            		data;

	            	params.total(orderedData.length); //set total recalculation for paganation
	            	$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
	        	}
    		});
		}).error(function(error){
			$scope.data.error = error;
		});
	}
]);