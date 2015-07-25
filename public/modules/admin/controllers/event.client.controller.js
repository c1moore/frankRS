'use strict';

angular.module('admin').controller ('eventController', ['$scope', 'ngTableParams', '$http', '$timeout', '$filter', '$modal', '$window', 'Authentication', '$location', 'eventSelector',
	function($scope, ngTableParams, $http, $timeout, $filter, $modal, $window, Authentication, $location, eventSelector) {
		if(!Authentication.user || _.intersection(Authentication.user.roles, ['admin']).length === 0) {
			if(!Authentication.user) {
				$location.path('/signin');
			} else {
				$location.path('/');
			}
		} else {
			$scope.events = [];

			//converts to date object so the date forms can be validated
			var toDate = function(element) {
				if (element.start_date && element.end_date) {
					element.start_date = new Date(element.start_date);
					element.end_date = new Date(element.end_date);
				}
			};

			var getEvents = function() {
				$http.get('/events/enumerateAll').success(function(data) {
					$scope.events = [];
					data.forEach(toDate);
					$scope.events = data;
				});
			};
			getEvents();

		  	$scope.tableParams = new ngTableParams({
	        	page: 1,
				count: 10,
				filter: {
				        name:''
				  },
				  sorting: {
				        name:'asc'
				  }
				}, {
				getData: function($defer, params) {
			        var filteredData = params.filter() ? $filter('filter')($scope.events, params.filter()) : $scope.events;
			        var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : $scope.events;
			        
			        params.total(orderedData.length);

					$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				}
	        });

	        $scope.$watch("events", function() {
				$scope.tableParams.reload();
			});

	        $scope.addEvent = function (newEvent) {
	        	newEvent.start_date = new Date(newEvent.start_date).getTime();
	        	newEvent.end_date = new Date(newEvent.end_date).getTime();
	        	
	        	$http.post('/events/create',newEvent).success(function() {
	        		getEvents();

		        	$scope.newEvent = null;
		        	$scope.eventForm.$setPristine(true);

		        	eventSelector.eventSelect();
	        	}).error(function(response, status) {
	        		if(status !== 401) {
		        		$window.alert("There was an error adding " + newEvent.name + ".  Please make sure all information is correct and try again.\n\nError: " + response.message + "\nIf this error continues, please <a href='/#!/problems'>report it</a>.");
		        	}
	        	});
	  		};

			$scope.updateEvent = function(event) {
				event.start_date = new Date(event.start_date).getTime();
	        	event.end_date = new Date(event.end_date).getTime();

				$http.post('/events/setEventObj',{event_id : event._id, event:event}).success(function() {
					getEvents();

		        	eventSelector.eventSelect();
				}).error(function(response, status) {
					if(status !== 401) {
						getEvents();
					
		        		$window.alert("There was an error updating " + event.name + ".  Please make sure all information is correct and try again.\n\nError: " + response.message + "\nIf this error continues, please <a href='/#!/problems'>report it</a>.");
		        	}
				});
			};


	  		//the following code sets up the date selectors in the event form 
	  		$scope.today = function() {
				$scope.dt = new Date();
			};
			$scope.today();

			$scope.clear = function() {
				$scope.dt = null;
			};

			$scope.openS = function($event) {
				$event.preventDefault();
				$event.stopPropagation();
				$scope.openedS = true;
			};

			$scope.openE = function($event) {
				$event.preventDefault();
				$event.stopPropagation();
				$scope.openedE = true;
			};

			$scope.dateOptions = {
				formatYear: 'yy',
				startingDay: 1
			};

			var deleteEvent = function(event) {
				$http.post('/events/delete',{event_id:event._id}).success(function() {
					getEvents();

		        	eventSelector.eventSelect();
				}).error(function(res, status) {
					if(status !== 401) {
						getEvents();

						$window.alert("An error occurred while deleting " + event.name +".\n\nError: " + res.message + "\nIf this error continues, please <a href='/#!/problems'>report it</a>.");
					}
				});
			};

			$scope.deleteEvent = function(event) {
				var modalInstance = $modal.open({
					templateUrl: 	"modules/admin/views/event-warn-delete.client.view.html",
					controller: 	"eventDeleteModalCtrl",
					backdrop: 		true,
					backdropClass: 	"admin-backdrop",
					resolve: 		{
						event: 	function() {
							return event;
						}
					}
				});

				modalInstance.result.then(function(result) {
					if(result) {
						deleteEvent(event);
					}
				});
			};

			var inactivateEvent = function(eid, ename) {
				$http.post('events/inactivate', {event_id : eid}).success(function() {
					getEvents();
				}).error(function(res, status) {
					if(status !== 401) {
						getEvents();
						
						$window.alert("An error occurred while disabling " + ename + ".\n\nError: " + res.message + "\nIf this error continues, please <a href='/#!/problems'>report it</a>.");
					}
				});
			};

			$scope.inactivateEvent = function(event) {
				var modalInstance = $modal.open({
					templateUrl: 	"modules/admin/views/event-warn-inactivate.client.view.html",
					controller: 	"eventInactivateModalCtrl",
					backdrop: 		true,
					backdropClass: 	"admin-backdrop",
					resolve: 		{
						event: 	function() {
							return event;
						}
					}
				});

				modalInstance.result.then(function(result) {
					if(result) {
						inactivateEvent(event._id, event.name);
					}
				});
			};
		}
	}
]);

angular.module("admin").controller("eventDeleteModalCtrl", ["$scope", "$modalInstance", "event",
	function($scope, $modalInstance, event) {
		$scope.event = event;

		$scope.done = function(action) {
			action = parseInt(action, 10);
			if(action) {
				$modalInstance.close(true);
			} else {
				$modalInstance.close(false);
			}
		};
	}
]);

angular.module("admin").controller("eventInactivateModalCtrl", ["$scope", "$modalInstance", "event",
	function($scope, $modalInstance, event) {
		$scope.event = event;

		$scope.done = function(action) {
			action = parseInt(action, 10);
			if(action) {
				$modalInstance.close(true);
			} else {
				$modalInstance.close(false);
			}
		};
	}
]);