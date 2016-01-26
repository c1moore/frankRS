'use strict';

angular.module('krewes').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('krewes', {
				url: '/krewes_portal',
				templateUrl: 'modules/krewes/views/krewes.client.view.html'
			});
	}
]);