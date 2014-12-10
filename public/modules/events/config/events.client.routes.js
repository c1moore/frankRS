'use strict';

angular.module('events').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Home state routing
		$stateProvider.
		state('events', {
			url: '/events',
			templateUrl: 'modules/events/views/events.client.view.html'
		});
	}
]);