'use strict'; // :)

angular.module('leaderboard').controller('InvitedController', ['$scope', 'Authentication', '$http',
	function($scope, Authentication, $http) {
		// route will be leaderboard/recuiterInfo
		$scope.data = {
			users: [],
			error: null
		};

		$http.get('/modules/leaderboard/tests/MOCK_INVITEE_DATA.json').success(function(data) {
			$scope.data.users = data;
		}).error(function(error){
			$scope.data.error = error;
		});

		//number of people to display on a page
		$scope.limitVal = 10;
		$scope.currentPage = 1;

		$scope.orderPredicate = '+displayName';

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
