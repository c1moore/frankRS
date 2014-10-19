angular.module('leaderboard').controller('LeaderboardController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		$scope.data = {
			users: [
				{rank:2 ,username:"User 1", invites:23, attending:10},
				{rank:1 ,username:"User 2", invites:10, attending:10},
				{rank:3 ,username:"User 3", invites:56, attending:13},
				{rank:4 ,username:"User 4", invites:12, attending:4},
				{rank:5 ,username:"User 5", invites:27, attending:17}
			],
			categories: ["Rank","User","Invited","Attending"]
		};

		$scope.limitVal = 10;
		$scope.sortBy = '+rank';

		$scope.activeOrder = function(order) {
			return order == $scope.sortBy ? "btn-primary" : "";
		}
	}
]);