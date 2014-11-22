angular.module('leaderboard').controller('LeaderboardTablesCtrl', ['$scope', 'Authentication', '$http', 'ngTableParams', '$filter', '$resource', '$location', 'eventSelector', '$timeout',
	function($scope, Authentication, $http, ngTableParams, $filter, $resource, $location, eventSelector, $timeout) {

		$scope.authentication = Authentication;

		/*
		* If the user is not logged in, they should be redirected to the sigin page.  If the
		* user is logged in, but does not have the proper permissions they should be
		* redirected to the homepage.
		*/
		if(!$scope.authentication.user) {
			$location.path('/signin');
		} 
		else if(($filter('roles')($scope.authentication.user.roles,['admin','recruiter'])).length === 0) {
			$location.path('/');
		}
		if(!eventSelector.nresDisabled) {
			eventSelector.toggleDisabledEvents();
			if(!eventSelector.recruiterEvent) {
				eventSelector.selectedEvent = "Select Event";
				eventSelector.recruiterEvent = true;
				eventSelector.postEventId = null;
			}
		}

		
		$scope.returnInt = function(value) {
			return Math.floor(value)
		}

		var mainApi = $resource('/leaderboard/maintable',{event_id: eventSelector.postEventId}, {'getTable':{method:'POST', isArray:true}});
		var attendingApi = $resource('/leaderboard/attendees',{event_id: eventSelector.postEventId}, {'getTable':{method:'POST', isArray:true}});
		var invitedApi = $resource('/leaderboard/invitees',{event_id: eventSelector.postEventId}, {'getTable':{method:'POST', isArray:true}});
		// var attendingApi = $resource('/modules/leaderboard/tests/MOCK_ATTENDEE_DATA.json');
		// var invitedApi = $resource('/modules/leaderboard/tests/MOCK_INVITEE_DATA.json');
		var testApi = $resource('/modules/leaderboard/tests/MOCK_DATA.json');

		$scope.mainTableParams = new ngTableParams({
        	page: 1,            // show first page
        	count: 10,           // count per page
        	filter: {
        		lName:''	//set the initial filter to nothing for name
        	},
        	sorting: {
        		rank:'asc'		// set the initial sorting to be rank asc
        	}
    		}, {
        	total: 0, // length of data
        	getData: function($defer, params) {
        		mainApi.getTable({event_id:eventSelector.postEventId}, function(data) {
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
            	attendingApi.getTable({event_id:eventSelector.postEventId}, function(data){
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
            	invitedApi.getTable(params.url,{event_id: eventSelector.postEventId}, function(data){
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



		$scope.$watch(
			function() {
				return eventSelector.selectedEvent;
			},
			function() {
				$timeout(function() {
        			// $scope.mainTableParams.settings().$scope = $scope;
        			// $scope.attendingTableParams.settings().$scope = $scope;
        			// $scope.invitedTableParams.settings().$scope = $scope;

					$scope.mainTableParams.reload();
					$scope.attendingTableParams.reload();
					$scope.invitedTableParams.reload();
				});
			}
		);
	}
]); 