angular.module('leaderboard').controller('LeaderboardTablesCtrl', ['$scope', 'Authentication', '$http', 'ngTableParams', '$filter', '$resource',
	function($scope, Authentication, $http, ngTableParams, $filter, $resource) {

		var mainApi = $resource('/leaderboard/maintable');
		var attendingApi = $resource('/modules/leaderboard/tests/MOCK_ATTENDEE_DATA.json')
		var invitedApi = $resource('/modules/leaderboard/tests/MOCK_INVITED_DATA.json');
		var testApi = $resource('/modules/leaderboard/tests/MOCK_DATA.json');

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
        	total: 0, // length of data
        	getData: function($defer, params) {
        		testApi.query(params.url(), function(data){
	            	var filteredData = params.filter() ?
	            		$filter('filter')(data, params.filter()) :
	            		data;
	            	var orderedData = params.sorting() ? 
	            		$filter('orderBy')(filteredData, params.orderBy()) : 
	            		data;

	            	params.total(orderedData.length); //set total recalculation for paganation
	            	$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
	            });
        	}
		});

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
        	total: 0, // length of data
        	getData: function($defer, params) {
            	attendingApi.query(params.url(), function(data){
	            	var filteredData = params.filter() ?
	            		$filter('filter')(data, params.filter()) :
	            		data;
	            	var orderedData = params.sorting() ? 
	            		$filter('orderBy')(filteredData, params.orderBy()) : 
	            		data;

	            	params.total(orderedData.length); //set total recalculation for paganation
	            	$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
	            });
        	}
		});

		$scope.invitedTableParams = new ngTableParams({
        	page: 1,            // show first page
        	count: 10,           // count per page
        	filter: {
        		displayName:''	//set the initial filter to nothing for name
        	},
        	sorting: {
        		displayName:'asc'		// set the initial sorting to be displayName asc
        	}
    		}, {
        	total: 0, // length of data
        	getData: function($defer, params) {
            	invitedApi.query(params.url(), function(data){
	            	var filteredData = params.filter() ?
	            		$filter('filter')(data, params.filter()) :
	            		data;
	            	var orderedData = params.sorting() ? 
	            		$filter('orderBy')(filteredData, params.orderBy()) : 
	            		data;

	            	params.total(orderedData.length); //set total recalculation for paganation
	            	$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
	            });
        	}
		});
	}
]); 