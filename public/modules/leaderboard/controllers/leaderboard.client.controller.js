'use strict'; // :)

angular.module('leaderboard').controller('LeaderboardController', ['$scope', 'Authentication', '$http',
	function($scope, Authentication, $http) {
		// route will be leaderboard/recuiterInfo
		$scope.leaderboardData = {
			users: [],
			error: null
		};

		$http.post('/leaderboard/maintable').success(function(data) {
			$scope.leaderboardData.users = data;
		}).error(function(error){
			$scope.data.error = error;
		});

		//number of people to display on a page
		$scope.limitVal = 10;
		$scope.currentPage = 1;

		$scope.orderPredicate = '+rank';

		$scope.setOrder = function(value) {
			if (value != $scope.orderPredicate.slice(1)) {
				$scope.orderPredicate = '+' + value;
			}
			else if ($scope.orderPredicate.slice(0,1) === '+') {
				$scope.orderPredicate = '-' + value;
			}
			else if ($scope.orderPredicate.slice(0,1) === '-') {
				$scope.orderPredicate = '+' + value;
			}
		};
	}
]);
