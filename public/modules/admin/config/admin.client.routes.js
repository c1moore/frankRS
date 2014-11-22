angular.module('admin').config(['$stateProvider', '$urlRouterProvider', 
	function($stateProvider, $urlRouterProvider) {

		$stateProvider.
		state("admin", { 
			url:"/admin", 
			templateUrl:"modules/admin/views/main.client.view.html" 
		});
	}
]);
