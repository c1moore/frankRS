angular.module('admin').config(['$stateProvider', '$urlRouterProvider', 
	function($stateProvider, $urlRouterProvider) {

		// $urlRouterProvider.otherwise("/admin/event");

		$stateProvider
			.state("admin", { abtract: true, url:"/admin", templateUrl:"modules/admin/views/main.view.client.html" })
			.state("admin.application", { url: "/application", templateUrl: "modules/admin/views/application.view.client.html", controller: "applicationController"  })
			.state("admin.event", { url: "/event", templateUrl: "modules/admin/views/event.view.client.html", controller: "eventController" })

	});
