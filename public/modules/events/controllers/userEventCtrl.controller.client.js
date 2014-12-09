angular.module('events').controller('userEventCtrl', ['$scope', 'ngTableParams', '$http', 'eventSelector', '$filter',
	function($scope, ngTableParams, $http, eventSelector, $filter) {
		$scope.events = [];
		$scope.userEvents = [];
		$scope.test = function(event) {
			console.log(event);
		}

		var getEvents = function() {
			$http.get('/events/enumerateAll').success(function(data) {
				$scope.events = [];
				$scope.events = data;
			}).error(function(error) {
				console.log(error);
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
	}
]);