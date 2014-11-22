angular.module('admin').controller ('eventController', ['$scope', 'ngTableParams',
	function($scope, ngTableParams) {
		$scope.events = [
			{
				name: 'Frank',
				start: '05/23/2014',
				end: '05/25/2014',
				location: 'Gainesville'
			},
			{
				name: 'Graduation',
				start: '12/18/2014',
				end: '12/19/2014',
				location: 'Gainesville'
			},
			{
				name: 'Concert',
				start: '06/07/2015',
				end: '06/20/2015',
				location: 'Jacksonville'
			},
			{
				name: 'Football game',
				start: '11/05/2014',
				end: '11/10/2014',
				location: 'Gainesville'
			},
			{
				name: 'Bonaroo',
				start: '06/13/2014',
				end: '07/01/2014',
				location: 'Tennessee'
			},
			{
				name: 'Doms Birthday',
				start: '05/24/2014',
				end: '05/25/2014',
				location: 'Somewhere'
			},
			{
				name: 'New hobbit movie!',
				start: '12/25/2014',
				end: '12/25/2014',
				location: 'New Zealand'
			}
		]; 

		$scope.addEvent = function () {

			$scope.events.push ({
				name: $scope.eventName,
				start: $scope.startDate,
				end: $scope.endDate,
				location: $scope.locationid
			});

		      // Clear input fields after push
		      $scope.eventName = "";
		      $scope.startDate = "";
		      $scope.endDate = "";
		      $scope.locationid = "";
  		};

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
	}
]);


