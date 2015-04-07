angular.module('leaderboard').controller('LeaderboardTablesCtrl', ['$scope', 'Authentication', '$http', 'ngTableParams', '$filter', '$resource', '$location', 'eventSelector', '$timeout',
	function($scope, Authentication, $http, ngTableParams, $filter, $resource, $location, eventSelector, $timeout) {

		$scope.authentication = Authentication;
		$scope.userScore = 0;						//Recruiter's rank out of all the recruiters for this event.
		$scope.userInvites = 0;						//Number of people this recruiter invited.
		$scope.userAttendees = 0;					//Number of people attending that this recruiter invited.
		$scope.statsError = false;					//Error retreiving stats for this event?

		$scope.mainTableFilter = {displayName : ''};

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
			return Math.floor(value);
		};

		var mainApi = $resource('/leaderboard/maintable',{event_id: eventSelector.postEventId}, {'getTable':{method:'POST', isArray:true}});
		var attendingApi = $resource('/leaderboard/attendees',{event_id: eventSelector.postEventId}, {'getTable':{method:'POST', isArray:true}});
		var invitedApi = $resource('/leaderboard/invitees',{event_id: eventSelector.postEventId}, {'getTable':{method:'POST', isArray:true}});

		var getTables = function() {
			$scope.mainTableParams = new ngTableParams({
	        	page: 1,            // show first page
	        	count: 10,           // count per page
	        	filter: $scope.mainTableFilter,
	        	/*{
	        		displayName:''	//set the initial filter to nothing for name
	        	},*/
	        	sorting: {
	        		place:'asc'		// set the initial sorting to be place asc
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
		            	var maxInvitedFilter = $filter('orderBy')(data,'invited', 'reverse');
		            	$scope.maxInvited = maxInvitedFilter[0].invited;

		            	var maxAttendingFilter = $filter('orderBy')(data,'attending', 'reverse');
		            	$scope.maxAttending = maxAttendingFilter[0].attending;

		            	params.total(orderedData.length); //set total recalculation for paganation
		            	$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
		            });
	        	},
	        	$scope: {$data: {}}
			});

			$scope.attendingTableParams = new ngTableParams({
	        	page: 1,            // show first page
	        	count: 10,           // count per page
	        	filter: {
	        		attendeeName:''	//set the initial filter to nothing for name
	        	},
	        	sorting: {
	        		attendeeName:'asc'		// set the initial sorting to be displayName asc
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
	        	},
	        	$scope: {$data: {}}
			});

			$scope.invitedTableParams = new ngTableParams({
	        	page: 1,            // show first page
	        	count: 10,           // count per page
	        	filter: {
	        		inviteeName:''	//set the initial filter to nothing for name
	        	},
	        	sorting: {
	        		inviteeName:'asc'		// set the initial sorting to be displayName asc
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
	        	},
	        	$scope: {$data: {}}
			});
		};

		if(!$scope.hasOwnProperty('params')) {
			$scope.params = new ngTableParams();
			$scope.params.isNullInstance = true;
		}
		$scope.params.settings().$scope = $scope;

		/**
		* Obtain the recruiter's stats: score, number attending, and number invited.
		*/
		$scope.smallRankHeader = false;
		var getStats = function() {
			$http.get('/leaderboard/recruiterinfo', {params : {event_id : eventSelector.postEventId}}).success(function(response) {
				if(response.place) {
					$scope.userScore = response.place;
				} else {
					$scope.userScore = "N/A";
					$scope.smallRankHeader = true;
				}

				$scope.userInvites = response.invited;
				$scope.userAttendees = response.attending;

				$http.get('/events/stats', {params : {event_id : eventSelector.postEventId}}).success(function(response) {
					$scope.capacity = response.capacity;
					$scope.attending = response.attending;
					$scope.invited = response.invited;

					if(($scope.invited + $scope.attending) < $scope.capacity && $scope.attending !== $scope.capacity) {
						$scope.percentAttending = Math.round(($scope.attending / $scope.capacity) * 100);
						$scope.percentInvited = Math.round(($scope.invited / $scope.capacity) * 100);
						$scope.percentCapacity = 100 - ($scope.percentAttending + $scope.percentInvited);
					} else if(($scope.invited >= $scope.capacity && $scope.attending !== $scope.capacity) || ($scope.attending < $scope.capacity && $scope.invited < $scope.capacity)) {
						var total = $scope.attending + $scope.invited + $scope.capacity;

						$scope.percentAttending = Math.round(($scope.attending / total) * 100);
						$scope.percentInvited = Math.round(($scope.invited / total) * 100);
						$scope.percentCapacity = 100 - ($scope.percentAttending + $scope.percentInvited);
					}
				}).error(function(response, status) {
					$scope.statsError = true;
				});
			}).error(function(response, status) {

			});
		};

		/**
		* Return the success rate ratio (number attending) / (total number invited and attending).
		*/
		$scope.getRatio = function() {
			if(($scope.userInvites + $scope.userAttendees) === 0) {
				return 0;
			} else {
				return (($scope.userAttendees/($scope.userInvites + $scope.userAttendees)) * 100).toFixed(2);
			}
		};

		/**
		* Set or reset the tables.
		*/
		var tablesSet = false;		//Will be used to determine if the tables have already been set previously.  If they have, simply reload the tables when a change is made.  If not, set them.
		$scope.$watch(
			function() {
				return eventSelector.selectedEvent;
			},
			function() {
				if(eventSelector.postEventId) {
					getStats();

					if(tablesSet) {
						$timeout(function() {
							$scope.mainTableParams.reload();
							$scope.attendingTableParams.reload();
							$scope.invitedTableParams.reload();
						});
					} else {
						getTables();
						tablesSet = true;
					}
				}
			}
		);
	}
]); 