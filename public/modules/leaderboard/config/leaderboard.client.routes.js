angular.module('leaderboard').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Home state routing
		$stateProvider.
		state('leaderboard', {
			url: '/leaderboard',
			templateUrl: 'modules/leaderboard/views/leaderboard.client.view.html'
		});
	}
]);