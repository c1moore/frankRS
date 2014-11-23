angular.module('admin').controller ('eventController', ['$scope', 'ngTableParams', '$http', '$timeout',
	function($scope, ngTableParams, $http, $timeout) {
		$scope.events = [
			{
				name: 'Frank',
				start_date: '05/23/2014',
				end_date: '05/25/2014',
				location: 'Gainesville'
			},
		];

		$http.get('/events/enumerateAll').success(function(data) {
			$scope.events = data;
		});

		$scope.deleteRow = function(index) {
	  		$scope.events.splice(index,1);
	  	}

	  	$scope.tableParams = new ngTableParams({
        	page: 1,
			count: 10,
        	}, {
        	getData: function($defer, params) {
				$defer.resolve($scope.events.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        	}
        });

        $scope.addEvent = function (newEvent) {
        	$scope.events.push(newEvent);
        	$scope.newEvent = null;
        	$scope.tableParams.reload();
  		};

  		$scope.$watch($scope.events, function() {
			$timeout(function() {
				$scope.tableParams.reload();
			});
		});


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


