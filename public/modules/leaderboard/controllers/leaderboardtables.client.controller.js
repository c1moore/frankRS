angular.module('leaderboard').controller('LeaderboardTablesCtrl', ['$scope', 'Authentication', '$http', 'ngTableParams', '$filter', '$resource', '$location',
	function($scope, Authentication, $http, ngTableParams, $filter, $resource, $location) {

		$scope.authentication = Authentication;

		/*
		* If the user is not logged in, they should be redirected to the sigin page.  If the
		* user is logged in, but does not have the proper permissions they should be
		* redirected to the homepage.
		*/
		if(!$scope.authentication.user) {
			$location.path('/signin');
		} else if(!(_.intersection($scope.authentication.user.roles, ['recruiter', 'admin']).length)) {
			$location.path('/');
		}

		//lets the score tab be the first active tab
		$scope.initialTab = true;
		
		$scope.returnInt = function(value) {
			return Math.floor(value)
		}

		var mainApi = $resource('/leaderboard/maintable',null, {'getTable':{method:'POST'}});
		var attendingApi = $resource('/leaderboard/attendees');
		var invitedApi = $resource('/leaderboard/invitees');
		// var attendingApi = $resource('/modules/leaderboard/tests/MOCK_ATTENDEE_DATA.json');
		// var invitedApi = $resource('/modules/leaderboard/tests/MOCK_INVITEE_DATA.json');
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
        		mainApi.getTable(params.url(), function(data){
	            	var filteredData = params.filter() ?
	            		$filter('filter')(data, params.filter()) :
	            		data;
	            	var orderedData = params.sorting() ? 
	            		$filter('orderBy')(filteredData, params.orderBy()) : 
	            		data;
	           
	           		//get the max invited and attending
	            	var maxInvitedFilter = $filter('orderBy')(data,'inviteeList.length', 'reverse');
	            	$scope.maxInvited = maxInvitedFilter[0].inviteeList.length;

	            	var maxAttendingFilter = $filter('orderBy')(data,'attendeeList.length', 'reverse');
	            	$scope.maxAttending = maxAttendingFilter[0].attendeeList.length;

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