angular.module('problems').config(['$stateProvider', '$urlRouterProvider', 
	function($stateProvider, $urlRouterProvider) {

		$stateProvider.
		state("problems", { 
			url:"/problems", 
			templateUrl:"modules/problems/views/problems.client.view.html" 
		});
	}
]);