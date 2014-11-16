angular.module('admin').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
		.state('admin', {
			url: '/admin',
			templateUrl:'modules/admin/views/admin.client.view.html'
		});
	}
]);
