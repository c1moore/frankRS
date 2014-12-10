angular.module('admin').controller ('eventController', ['$scope', 'ngTableParams', '$http', '$timeout', '$filter',
	function($scope, ngTableParams, $http, $timeout, $filter) {
		$scope.events = [];

		$scope.test = function(event) {
			console.log(event);
		}

		//converts to date object so the date forms can be validated
		var toDate = function(element) {
			if (element.start_date && element.end_date) {
				element.start_date = new Date(element.start_date);
				element.end_date = new Date(element.end_date);
			};
		}

		var getEvents = function() {
			$http.get('/events/enumerateAll').success(function(data) {
				$scope.events = [];
				data.forEach(toDate);
				$scope.events = data;
			});
		}
		getEvents();

	  	$scope.tableParams = new ngTableParams({
        	page: 1,
			count: 5,
			filter: {
			        name:''
			  },
			  sorting: {
			        name:'asc'
			  }
			}, {
			getData: function($defer, params) {
		        var filteredData = params.filter() ?
		              $filter('filter')($scope.events, params.filter()) :
		              $scope.events;
		        var orderedData = params.sorting() ? 
		              $filter('orderBy')(filteredData, params.orderBy()) : 
		              $scope.events;
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
        		console.log('Event created');
        		getEvents();
        	}).error(function(error) {
        		console.log(error);
        	});
        	$scope.newEvent = null;
        	$scope.eventForm.$setPristine(true);
  		};

		$scope.deleteEvent = function(event) {
			$http.post('/events/delete',{event_id:event._id}).success(function() {
				console.log('Event Deleted');
				getEvents()
			});
		};

		$scope.updateEvent = function(event) {
			event.start_date = new Date(event.start_date).getTime();
        	event.end_date = new Date(event.end_date).getTime();
			$http.post('/events/setEventObj',{event_id : event._id, event:event}).success(function() {
				console.log("Event Updated");
				getEvents();
			}).error(function(error) {
				console.log(error);
				getEvents();
			});
		};


  		//the following code sets up the date selectors in the event form 
  		$scope.today = function() {
			$scope.dt = new Date();
		}
		$scope.today();

		$scope.clear = function() {
			$scope.dt = null;
		}

		$scope.openS = function($event) {
			$event.preventDefault();
			$event.stopPropagation();
			$scope.openedS = true;
		}

		$scope.openE = function($event) {
			$event.preventDefault();
			$event.stopPropagation();
			$scope.openedE = true;
		}

		$scope.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
		};
	}
]);


