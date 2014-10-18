'use strict';

angular.module('invites').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Home state routing
		$stateProvider.
		state('invite', {
			url: '/invite',
			templateUrl: 'modules/invites/views/invites.client.view.html'
		});
	}
]);
