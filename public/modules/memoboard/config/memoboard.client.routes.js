'use strict';

angular.module('memoboard').config(['$stateProvider', '$urlRouterProvider', 
	function($stateProvider, $urlRouterProvider) {

		$stateProvider.
		state("franklounge", { 
			url:"/franklounge", 
			templateUrl:"modules/memoboard/views/memoboard.client.view.html" 
		});
	}
]);
