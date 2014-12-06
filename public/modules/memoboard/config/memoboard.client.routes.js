angular.module('memoboard').config(['$stateProvider', '$urlRouterProvider', 
	function($stateProvider, $urlRouterProvider) {

		$stateProvider.
		state("memoboard", { 
			url:"/memoboard", 
			templateUrl:"modules/memoboard/views/memoboard.client.view.html" 
		});
	}
]);
