'use strict';

angular.module('leaderboard').controller('LeaderboardTablesCtrl', ['$scope', 'Authentication', '$http', 'ngTableParams', '$filter', '$resource', '$location', 'eventSelector', '$timeout',
	function($scope, Authentication, $http, ngTableParams, $filter, $resource, $location, eventSelector, $timeout) {
		if(!Authentication.user || _.intersection(Authentication.user.roles, ['admin', 'recruiter']).length === 0) {
			if(!Authentication.user) {
				$location.path('/signin');
			} else {
				$location.path('/');
			}
		} else {
			$scope.authentication = Authentication;
			$scope.userScore = 0;						//Recruiter's rank out of all the recruiters for this event.
			$scope.userInvites = 0;						//Number of people this recruiter invited.
			$scope.userAttendees = 0;					//Number of people attending that this recruiter invited.
			$scope.statsError = false;					//Error retreiving stats for this event?
			$scope.inviteeAttendeeRatio = 0.05;			//The points ratio of invitees to attendees.

			$scope.mainTableFilter = {displayName : ''};

			if(!eventSelector.recruiterEvent) {
				eventSelector.selectedEvent = "Select Event";
				eventSelector.recruiterEvent = true;
				eventSelector.postEventId = null;
			}
			
			$scope.returnInt = function(value) {
				return Math.floor(value);
			};

			/* Create an array of specified length.  Used to create an array ngRepeat can iterate over when creating infographics on attendance. */
			$scope.getArr = function(length) {
				return new Array(length);
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
							var filteredData = params.filter() ? $filter('filter')(data, params.filter()) : data;
							var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : data;

							//Find the number of people invited by the person in first place.
							if(params.orderBy() !== 'place' || params.sorting().place !== 'asc') {
								var maxFilter = $filter('orderBy')(data, 'place');
								$scope.maxValue = maxFilter[0].attending + (maxFilter[0].invited * $scope.inviteeAttendeeRatio);
							} else {
								//No need to sort the data again
								$scope.maxValue = orderedData[0].attending + (orderedData[0].invited * $scope.inviteeAttendeeRatio);
							}

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
							var filteredData = params.filter() ? $filter('filter')(data, params.filter()) : data;
							var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : data;

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
							var filteredData = params.filter() ? $filter('filter')(data, params.filter()) : data;
							var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : data;


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

						//Find ratio of above stats to the capacity for the event.  Convert to percent and divide by 2 (make the number easier to display on the screen).
						$scope.percentInvited = Math.round(($scope.invited / $scope.capacity) * 50);
						$scope.percentAttending = Math.round(($scope.attending / $scope.capacity) * 50);
						$scope.percentCapacity = 50;
					}).error(function(response, status) {
						$scope.statsError = true;
					});
				}).error(function(response, status) {
					//Fail silently since the interceptor should handle any important cases and notices can be annoying.  Attempt again in 5 seconds.
					if(status !== 401 && $location.path()=== "/leaderboard") {
						$timeout(function() {
							getStats();
						}, 5000);
					}
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
	}
]); 