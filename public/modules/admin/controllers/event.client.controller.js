angular.module('admin').controller ('eventController', ['$scope', 'ngTableParams', '$http', '$timeout',
	function($scope, ngTableParams, $http, $timeout) {
		$scope.events = [];

		var getEvents = function() {
			$http.get('/events/enumerateAll').success(function(data) {
				$scope.events = data;
			});
		}
		getEvents();

	  	$scope.tableParams = new ngTableParams({
        	page: 1,
			count: 10,
        	}, {
        	getData: function($defer, params) {
				$defer.resolve($scope.events.slice((params.page() - 1) * params.count(), params.page() * params.count()));
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
        	});
        	$scope.newEvent = null;
  		};

		$scope.deleteEvent = function(event) {
			$http.post('/events/delete',{event_id:event._id}).success(function() {
				console.log('Event Deleted');
				getEvents()
			});
		};

		$scope.updateEvent = function(event) {
			$http.post('/events/setName',event).success(function() {
				console.log("Event Updated");
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


